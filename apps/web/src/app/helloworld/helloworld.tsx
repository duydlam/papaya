'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { API_URL, TOKEN_KEY } from './helloworld.constants';
import type { HelloWorld } from './helloworld.types';

export function HelloWorldApp() {
  const [token, setToken] = useState('');
  const [items, setItems] = useState<HelloWorld[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(true);

  const request = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const response = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...init.headers,
        },
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      return response.status === 204 ? null : response.json();
    },
    [token],
  );

  const refresh = useCallback(
    async () => setItems(await request('/helloworld')),
    [request],
  );
  const startSession = useCallback(async () => {
    setError('');
    setStarting(true);
    try {
      const response = await fetch(`${API_URL}/auth/demo`, { method: 'POST' });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      const result = await response.json();
      localStorage.setItem(TOKEN_KEY, result.accessToken);
      setToken(result.accessToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start a session');
    } finally {
      setStarting(false);
    }
  }, []);

  useEffect(() => {
    void startSession();
  }, [startSession]);
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      refresh().catch((e) => setError(e.message));
    }
  }, [token, refresh]);

  async function create(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      await request('/helloworld', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
      setMessage('');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    }
  }
  async function update(item: HelloWorld) {
    const next = window.prompt('Edit message', item.message);
    if (next === null || !next.trim()) return;
    try {
      await request(`/helloworld/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ message: next }),
      });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  }
  async function remove(id: string) {
    try {
      await request(`/helloworld/${id}`, { method: 'DELETE' });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  }
  return (
    <main className="shell">
      <header>
        <div>
          <p className="eyebrow">PAPAYA · API STARTER</p>
          <h1>Hello, world.</h1>
          <p className="muted">A small full stack CRUD flow, ready to grow.</p>
        </div>
      </header>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {!token ? (
        <section className="panel">
          <p>
            {starting ? 'Starting your demo session…' : 'Could not connect.'}
          </p>
          {!starting && (
            <button onClick={() => void startSession()}>Retry</button>
          )}
        </section>
      ) : (
        <>
          <form className="panel composer" onSubmit={create}>
            <label htmlFor="message">New message</label>
            <div className="row">
              <input
                id="message"
                value={message}
                maxLength={120}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write something…"
                required
              />
              <button disabled={!message.trim()}>Add message</button>
            </div>
          </form>
          <section className="entries">
            <div className="section-title">
              <h2>Messages</h2>
              <span>{items.length} total</span>
            </div>
            {items.length ? (
              items.map((item) => (
                <article className="entry" key={item.id}>
                  <div>
                    <p>{item.message}</p>
                    <time>{new Date(item.createdAt).toLocaleString()}</time>
                  </div>
                  <div className="actions">
                    <button className="quiet" onClick={() => update(item)}>
                      Edit
                    </button>
                    <button className="danger" onClick={() => remove(item.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty">
                Nothing here yet. Add your first message.
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
