// BooksLogic.js
// Centralized logic for handling exchanges, barter progression, and day simulation
// This would ideally be replaced by a backend/database in production

const API_BASE = process.env.REACT_APP_API_BASE || '';

export async function getBarters(username) {
  const res = await fetch(`${API_BASE}/api/books/${username}`);
  if (!res.ok) return [];
  return await res.json();
}

export async function addBarter(username, barter) {
  if (barter.yourTokensGiven > barter.yourCap) {
    console.warn(`Barter rejected: ${barter.yourTokensGiven} > cap ${barter.yourCap}`);
    return;
  }
  await fetch(`${API_BASE}/api/books/${username}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(barter)
  });
}

export async function progressBarterDay(username, barterId) {
  const res = await fetch(`${API_BASE}/api/books/${username}/${barterId}/progress`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to progress barter');
  return await res.json();
}

export async function approveProgress(username, barterId) {
  const res = await fetch(`${API_BASE}/api/books/${username}/${barterId}/approve`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to approve progression');
  return await res.json();
}

