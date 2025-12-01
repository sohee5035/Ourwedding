// API client for wedding planning app
import type { GroupGuest } from '../types';

export async function fetchWeddingInfo() {
  const res = await fetch('/api/wedding-info', {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch wedding info');
  return res.json();
}

export async function updateWeddingInfo(data: any) {
  const res = await fetch('/api/wedding-info', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update wedding info');
  return res.json();
}

// Venues
export async function fetchVenues() {
  const res = await fetch('/api/venues', {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch venues');
  return res.json();
}

export async function fetchVenue(id: string) {
  const res = await fetch(`/api/venues/${id}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch venue');
  return res.json();
}

export async function createVenue(data: any) {
  const res = await fetch('/api/venues', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create venue');
  return res.json();
}

export async function updateVenue(id: string, data: any) {
  const res = await fetch(`/api/venues/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update venue');
  return res.json();
}

export async function deleteVenue(id: string) {
  const res = await fetch(`/api/venues/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete venue');
}

// Venue Quotes
export async function fetchAllVenueQuotes() {
  const res = await fetch('/api/venue-quotes', {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch venue quotes');
  return res.json();
}

export async function fetchVenueQuotes(venueId: string) {
  const res = await fetch(`/api/venues/${venueId}/quotes`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch venue quotes');
  return res.json();
}

export async function fetchVenueQuote(id: string) {
  const res = await fetch(`/api/venue-quotes/${id}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch venue quote');
  return res.json();
}

export async function createVenueQuote(data: any) {
  const res = await fetch('/api/venue-quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create venue quote');
  return res.json();
}

export async function updateVenueQuote(id: string, data: any) {
  const res = await fetch(`/api/venue-quotes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update venue quote');
  return res.json();
}

export async function deleteVenueQuote(id: string) {
  const res = await fetch(`/api/venue-quotes/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete venue quote');
}

// Checklist
export async function fetchChecklistItems() {
  const res = await fetch('/api/checklist', {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch checklist items');
  return res.json();
}

export async function createChecklistItem(data: any) {
  const res = await fetch('/api/checklist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create checklist item');
  return res.json();
}

export async function updateChecklistItem(id: string, data: any) {
  const res = await fetch(`/api/checklist/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update checklist item');
  return res.json();
}

export async function deleteChecklistItem(id: string) {
  const res = await fetch(`/api/checklist/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete checklist item');
}

// Budget
export async function fetchBudgetItems() {
  const res = await fetch('/api/budget', {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch budget items');
  return res.json();
}

export async function createBudgetItem(data: any) {
  const res = await fetch('/api/budget', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create budget item');
  return res.json();
}

export async function updateBudgetItem(id: string, data: any) {
  const res = await fetch(`/api/budget/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update budget item');
  return res.json();
}

export async function deleteBudgetItem(id: string) {
  const res = await fetch(`/api/budget/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete budget item');
}

// Guests
export async function fetchGuests() {
  const res = await fetch('/api/guests', {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch guests');
  return res.json();
}

export async function createGuest(data: any) {
  const res = await fetch('/api/guests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create guest');
  return res.json();
}

export async function updateGuest(id: string, data: any) {
  const res = await fetch(`/api/guests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update guest');
  return res.json();
}

export async function deleteGuest(id: string) {
  const res = await fetch(`/api/guests/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete guest');
}

// Group Guests
export async function fetchGroupGuests(): Promise<GroupGuest[]> {
  const res = await fetch('/api/group-guests', {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch group guests');
  return res.json();
}

export async function createGroupGuest(data: Omit<GroupGuest, 'id' | 'createdAt'>): Promise<GroupGuest> {
  const res = await fetch('/api/group-guests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create group guest');
  return res.json();
}

export async function updateGroupGuest(id: string, data: Partial<Omit<GroupGuest, 'id' | 'createdAt'>>): Promise<GroupGuest> {
  const res = await fetch(`/api/group-guests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update group guest');
  return res.json();
}

export async function deleteGroupGuest(id: string): Promise<void> {
  const res = await fetch(`/api/group-guests/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete group guest');
}
