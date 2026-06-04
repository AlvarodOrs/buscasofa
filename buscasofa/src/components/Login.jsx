import { useNavigate } from 'react-router-dom'; 
import React, { useState } from 'react';

// @ts-ignore
import './Form.css';


// /**
//  * @param {{ onLogin?: (username: string) => void }} props
//  */
function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');

  const payload = {
    identifier: form.email,   // Para pasar test de login y poder usar el backend de gestion de username o email
    password: form.password
  };

  const res = await fetch('http://localhost:4000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const data = await res.json();

    if (res.ok) {
      const user = {
        username: data.username,
        email: data.email
      }
      setMsg('¡Bienvenido, ' + data.username + '!');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(user));
      if (onLogin) onLogin(user);
      navigate('/perfil');
    } else {
      setMsg(data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Iniciar Sesión</h2>
      <input name="email" type="text" placeholder="Email o usuario" onChange={handleChange} required /* Usaría name="identifier", pero el test pide email */ /> 
      <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} required />
      <button type="submit">Entrar</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}

export default Login;