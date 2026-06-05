import React, { useState, useEffect, useCallback } from 'react';

// @ts-ignore
import './Profile.css';


const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const renderStars = value => '★'.repeat(value) + '☆'.repeat(5 - value);

function Comments({ user }) {
  const [comments, setComments] = useState([]);

  const fetchComments = useCallback(async () => {
    const res = await fetch(`${BASE_URL}/api/comments/user/${user.username}`);
    const data = await res.json();
    setComments(data);
  }, [user.username]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <ul className="comments-list">
      <h1>Tus comentarios:</h1>
      {comments.map((c, idx) => (
        <li key={idx}>
          <h3>{user.username}<i> {user.email}</i></h3>{' '}
          <div className='comment-section'>
            <h1 className="comment-rating">{renderStars(c.rating || c.stars || 0)}</h1>
            <blockquote>
              {c.comment}
              <cite><br/>{new Date(new Date(c.created_at).getTime() + 2 * 60 * 60 * 1000).toLocaleString('es-ES')}</cite>
            </blockquote>
          </div>
        </li>
      ))}
    </ul>
  );
}

function EditProfile({ user, token, onClose, onSave }) {
  const [field, setField] = useState('username');
  const [newValue, setNewValue] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!newValue || !currentPassword) {
      setError('Rellena todos los campos');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/user/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ field, newValue, currentPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      onSave(data.user); // update parent state + localStorage
      onClose();
    } catch {
      setError('Error de red');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-overlay" onClick={onClose}>
      <div className="edit" onClick={e => e.stopPropagation()}>
        <h3>Editar perfil</h3>

        <label>Campo a cambiar</label>
        <select value={field} onChange={e => { setField(e.target.value); setNewValue(''); }}>
          <option value="username">Nombre de usuario</option>
          <option value="email">Email</option>
          <option value="password">Contraseña</option>
        </select>

        <label>Nuev{field === 'username' ? 'o nombre' : field === 'email' ? 'o correo electrónico' : 'a contraseña'}</label>
        <input
          type={field === 'password' ? 'password' : 'text'}
          placeholder={`Nuevo ${field}`}
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
        />

        <label>Contraseña actual (para confirmar)</label>
        <input
          type="password"
          placeholder="Contraseña actual"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
        />

        {error && <p className="edit-error">{error}</p>}

        <div className="edit-actions">
          <button onClick={onClose} disabled={loading}>Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Profile() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [showEdit, setShowEdit] = useState(false);
  const token = localStorage.getItem('token');

  const handleSave = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    localStorage.setItem('user', JSON.stringify(merged));
  };

  if (!user?.email && !user?.username) {
    return (
      <div className="about-container">
        <h1>Perfil</h1>
        <div id="info">
          <h2>Acceso restringido</h2>
          <p>No has iniciado sesión</p>
        </div>
      </div>
    );
  }

  return (
    <div className="about-container">
      <h1>Perfil</h1>

      <div id="info" className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2>{user.username}</h2>
            <p className="muted">{user.email}</p>
          </div>
          <div className="edit-btn">
            <button onClick={() => setShowEdit(true)} title="Editar perfil">
              ✏️
            </button>
          </div>
        </div>

        <div className="profile-body">
          <div className="profile-row"><span>Status</span><span className="badge">Activo</span></div>
          <div className="profile-row"><span>Tipo de cuenta</span><span>Usuario</span></div>
          <div className="profile-row"><span>Acceso</span><span>JWT Auth</span></div>
        </div>
      </div>

      <Comments user={user} />
      {showEdit && (
        <EditProfile
          user={user}
          token={token}
          onClose={() => setShowEdit(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default Profile;