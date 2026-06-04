import React from 'react';

// @ts-ignore
import './Profile.css';

function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!(user.email || user.username)) {
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
        </div>

        <div className="profile-body">
          <div className="profile-row">
            <span>Status</span>
            <span className="badge">Activo</span>
          </div>

          <div className="profile-row">
            <span>Tipo de cuenta</span>
            <span>Usuario</span>
          </div>

          <div className="profile-row">
            <span>Acceso</span>
            <span>JWT Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;