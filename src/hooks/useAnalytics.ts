import { useMemo } from 'react';
import { InventoryItem, Transaction } from '../types';

export function useAnalytics(items: InventoryItem[], history: Transaction[]) {
  return useMemo(() => {
    const now = new Date();
    
    // 1. Frequently Brought Items (IN transactions)
    const inTransactions = history.filter(t => t.type === 'IN');
    const frequencyMap: Record<string, number> = {};
    const quantityMap: Record<string, number> = {};
    const additionDatesMap: Record<string, Date[]> = {};
    
    inTransactions.forEach(t => {
      frequencyMap[t.itemId] = (frequencyMap[t.itemId] || 0) + 1;
      quantityMap[t.itemId] = (quantityMap[t.itemId] || 0) + t.quantity;
      if (!additionDatesMap[t.itemId]) additionDatesMap[t.itemId] = [];
      additionDatesMap[t.itemId].push(new Date(t.timestamp));
    });
    
    // Calculate average days between "IN" for each item
    const restockingPatterns = items.map(item => {
      const dates = additionDatesMap[item.id] || [];
      dates.sort((a, b) => a.getTime() - b.getTime());
      
      let avgDays = null;
      let nextExpectedRestock: Date | null = null;
      let isDue = false;
      
      if (dates.length >= 2) {
        let totalDays = 0;
        for (let i = 1; i < dates.length; i++) {
          const diffTime = Math.abs(dates[i].getTime() - dates[i-1].getTime());
          totalDays += diffTime / (1000 * 60 * 60 * 24);
        }
        avgDays = totalDays / (dates.length - 1);
        
        const lastDate = dates[dates.length - 1];
        nextExpectedRestock = new Date(lastDate.getTime() + avgDays * 24 * 60 * 60 * 1000);
        
        // Let's say if we are within 20% of avgDays or past the nextExpected time, it is due
        const daysSinceLast = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLast >= avgDays * 0.8) {
          isDue = true;
        }
      }
      
      return {
        item,
        frequency: frequencyMap[item.id] || 0,
        totalAddedQuantity: quantityMap[item.id] || 0,
        avgDaysBetweenRestock: avgDays,
        nextExpectedRestock,
        isDue
      };
    });
    
    restockingPatterns.sort((a, b) => b.frequency - a.frequency);
    
    // 2. Items bought together (transactions within same day/minute?)
    // Group transactions by close time (e.g., within 1 hour)
    const transactionGroups = [];
    const sortedInTrans = [...inTransactions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    let currentGroup = [];
    for (const t of sortedInTrans) {
      if (currentGroup.length === 0) {
        currentGroup.push(t);
      } else {
        const lastT = currentGroup[currentGroup.length - 1];
        const diffMs = Math.abs(new Date(t.timestamp).getTime() - new Date(lastT.timestamp).getTime());
        // If within 1 hour
        if (diffMs < 60 * 60 * 1000) {
          currentGroup.push(t);
        } else {
          transactionGroups.push(currentGroup);
          currentGroup = [t];
        }
      }
    }
    if (currentGroup.length > 0) transactionGroups.push(currentGroup);

    // Count pairs
    const pairsMap: Record<string, number> = {};
    transactionGroups.forEach(group => {
      const itemIds = Array.from(new Set(group.map(t => t.itemId)));
      if (itemIds.length >= 2) {
        for (let i = 0; i < itemIds.length; i++) {
          for (let j = i + 1; j < itemIds.length; j++) {
            const pair = [itemIds[i], itemIds[j]].sort().join('|');
            pairsMap[pair] = (pairsMap[pair] || 0) + 1;
          }
        }
      }
    });
    
    const boughtTogether = Object.entries(pairsMap)
      .map(([pairStr, count]) => {
        const [id1, id2] = pairStr.split('|');
        const item1 = items.find(i => i.id === id1);
        const item2 = items.find(i => i.id === id2);
        return { item1, item2, count };
      })
      .filter(p => p.item1 && p.item2)
      .sort((a, b) => b.count - a.count);

    return {
      restockingPatterns,
      frequentlyBought: restockingPatterns.filter(r => r.frequency > 0),
      boughtTogether,
      dueForRestock: restockingPatterns.filter(r => r.isDue)
    };
  }, [items, history]);
}
