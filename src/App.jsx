import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (user === 'admin' && pass === '12345') {
      setIsLogged(true);
    } else {
      alert('Credenciales incorrectas. Intenta con admin y 12345');
    }
  };

  if (!isLogged) {
    return (
      <div className="login-container">
        <h2>☁️ SISTEMA CLOUD</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input type="text" placeholder="Usuario" onChange={e => setUser(e.target.value)} required />
          <input type="password" placeholder="Contraseña" onChange={e => setPass(e.target.value)} required />
          <button type="submit">INICIAR SESIÓN</button>
        </form>
      </div>
    );
  }

  return <CrudSystem />;
}

function CrudSystem() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({ ID: '', Nombre: '', Precio: '', Categoria: '', Stock: '' });
  const [busqueda, setBusqueda] = useState(''); 

  const API_URL = '/.netlify/functions/api';

  const fetchProductos = async () => {
    const res = await fetch(API_URL);
    if(res.ok) {
      const data = await res.json();
      setProductos(data);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.ID) {
      await fetch(API_URL, { method: 'PUT', body: JSON.stringify(form) });
    } else {
      await fetch(API_URL, { method: 'POST', body: JSON.stringify(form) });
    }
    setForm({ ID: '', Nombre: '', Precio: '', Categoria: '', Stock: '' });
    fetchProductos();
  };

  const handleEdit = (prod) => setForm(prod);

  const handleDelete = async (ID) => {
    if (window.confirm("¿Deseas eliminar este registro?")) {
      await fetch(API_URL, { method: 'DELETE', body: JSON.stringify({ ID }) });
      fetchProductos();
    }
  };

  const productosFiltrados = productos.filter(p => 
    p.Nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="crud-container">
      <h2>📦 Gestión de Productos</h2>
      
      <div className="buscador">
        <input type="text" placeholder="🔍 Buscar producto por nombre..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
      </div>
      
      <form onSubmit={handleSubmit} className="crud-form">
        <input type="text" name="Nombre" placeholder="Nombre" value={form.Nombre} onChange={handleChange} required />
        <input type="number" name="Precio" placeholder="Precio" value={form.Precio} onChange={handleChange} required />
        <input type="text" name="Categoria" placeholder="Categoría" value={form.Categoria} onChange={handleChange} required />
        <input type="number" name="Stock" placeholder="Stock" value={form.Stock} onChange={handleChange} required />
        <button type="submit" className={form.ID ? 'btn-edit' : 'btn-add'}>
          {form.ID ? '✏️ ACTUALIZAR' : '➕ AGREGAR'}
        </button>
      </form>

      <table className="tabla-productos">
        <thead>
          <tr><th>Nombre</th><th>Precio</th><th>Categoría</th><th>Stock</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {productosFiltrados.map((p, i) => (
            <tr key={i}>
              <td>{p.Nombre}</td><td>${p.Precio}</td><td>{p.Categoria}</td><td>{p.Stock}</td>
              <td className="acciones">
                <button onClick={() => handleEdit(p)} className="btn-small">Editar</button>
                <button onClick={() => handleDelete(p.ID)} className="btn-small btn-delete">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;