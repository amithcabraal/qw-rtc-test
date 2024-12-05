export function generateGameCode(length: number = 4): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function shareGameCode(code: string): Promise<boolean> {
  if (!code) return false;
  
  const shareData = {
    title: 'Join Quiz Game',
    text: `Join my quiz game with code: ${code}`,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error sharing:', err);
    return false;
  }
}