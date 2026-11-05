'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { API_URL, TOKEN_KEY } from './helloworld.constants';
import type { HelloWorld } from './helloworld.types';

export function HelloWorldApp() {
  const [token, setToken] = useState('');
  const [items, setItems] = useState<HelloWorld[]>([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('papaya');
  const [password, setPassword] = useState('papaya');
  const [error, setError] = useState('');

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
  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) setToken(saved);
  }, []);
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      refresh().catch((e) => setError(e.message));
    }
  }, [token, refresh]);

  async function login(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      const result = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setToken(result.accessToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    }
  }
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
  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setItems([]);
  }

  return (
    <main className="shell">
      <header>
        <div>
          <p className="eyebrow">PAPAYA · API STARTER</p>
          <h1>Hello, world.</h1>
          <p className="muted">A small full stack CRUD flow, ready to grow.</p>
        </div>
        {token && (
          <button className="quiet" onClick={logout}>
            Sign out
          </button>
        )}
      </header>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {!token ? (
        <form className="panel login" onSubmit={login}>
          <h2>Sign in</h2>
          <label>
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button>Continue</button>
          <small>Local demo credentials: papaya / papaya</small>
        </form>
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
