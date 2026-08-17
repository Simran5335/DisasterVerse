// Common Gamification Backend Service for DisasterVerse
export const awardXP = (amount, reason) => {
  const currentTotal = parseInt(localStorage.getItem('userXP') || '3450', 10);
  const newTotal = currentTotal + amount;
  localStorage.setItem('userXP', newTotal.toString());

  // Record history log
  const xpHistory = JSON.parse(localStorage.getItem('xpHistory') || '[]');
  xpHistory.push({
    timestamp: new Date().toISOString(),
    amount,
    reason
  });
  localStorage.setItem('xpHistory', JSON.stringify(xpHistory));

  console.log(`[GAMIFICATION] Awarded +${amount} XP for ${reason}. Total: ${newTotal}`);
  return { newTotal, amount, reason };
};
