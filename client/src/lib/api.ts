// API client for wedding planning app

export async function fetchWeddingInfo() {
  const res = await fetch('/api/wedding-info');
  if (!res.ok) throw new Error('Failed to fetch wedding info');
  return res.json();
}

export async function updateWeddingInfo(data: any) {
  const res = await fetch('/api/wedding-info', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update wedding info');
  return res.json();
}

// Venues
export async function fetchVenues() {
  const res = await fetch('/api/venues');
  if (!res.ok) throw new Error('Failed to fetch venues');
  return res.json();
}

export async function fetchVenue(id: string) {
  const res = await fetch(`/api/venues/${id}`);
  if (!res.ok) throw new Error('Failed to fetch venue');
  return res.json();
}

export async function createVenue(data: any) {
  const res = await fetch('/api/venues', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create venue');
  return res.json();
}

export async function updateVenue(id: string, data: any) {
  const res = await fetch(`/api/venues/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update venue');
  return res.json();
}

export async function deleteVenue(id: string) {
  const res = await fetch(`/api/venues/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete venue');
}

// Checklist
export async function fetchChecklistItems() {
  const res = await fetch('/api/checklist');
  if (!res.ok) throw new Error('Failed to fetch checklist items');
  return res.json();
}

export async function createChecklistItem(data: any) {
  const res = await fetch('/api/checklist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create checklist item');
  return res.json();
}

export async function updateChecklistItem(id: string, data: any) {
  const res = await fetch(`/api/checklist/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update checklist item');
  return res.json();
}

export async function deleteChecklistItem(id: string) {
  const res = await fetch(`/api/checklist/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete checklist item');
}

// Budget
export async function fetchBudgetItems() {
  const res = await fetch('/api/budget');
  if (!res.ok) throw new Error('Failed to fetch budget items');
  return res.json();
}

export async function createBudgetItem(data: any) {
  const res = await fetch('/api/budget', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create budget item');
  return res.json();
}

export async function updateBudgetItem(id: string, data: any) {
  const res = await fetch(`/api/budget/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update budget item');
  return res.json();
}

export async function deleteBudgetItem(id: string) {
  const res = await fetch(`/api/budget/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete budget item');
}

// Guests
export async function fetchGuests() {
  const res = await fetch('/api/guests');
  if (!res.ok) throw new Error('Failed to fetch guests');
  return res.json();
}

export async function createGuest(data: any) {
  const res = await fetch('/api/guests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create guest');
  return res.json();
}

export async function updateGuest(id: string, data: any) {
  const res = await fetch(`/api/guests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update guest');
  return res.json();
}

export async function deleteGuest(id: string) {
  const res = await fetch(`/api/guests/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete guest');
}
