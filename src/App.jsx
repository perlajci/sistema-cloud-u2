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
      alert('❌ Credenciales incorrectas. Intenta con admin y 12345');
    }
  };

  if (!isLogged) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h2>SISTEMA CLOUD</h2>
          <p>Inicia sesión para continuar</p>
          <form onSubmit={handleLogin} className="login-form">
            <input type="text" placeholder="Usuario" value={user} onChange={e => setUser(e.target.value)} required />
            <input type="password" placeholder="Contraseña" value={pass} onChange={e => setPass(e.target.value)} required />
            <button type="submit">INICIAR SESIÓN</button>
          </form>
        </div>
      </div>
    );
  }

  return <CrudSystem />;
}

function CrudSystem() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({ ID: '', Nombre: '', Precio: '', Categoria: '', Stock: '' });
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = '/.netlify/functions/api';

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if(res.ok) {
        const data = await res.json();
        setProductos(data);
      }
    } catch (error) {
      console.error("Error al cargar datos", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // FUNCIONALIDAD EXTRA D: Validación
    if(form.Precio <= 0 || form.Stock < 0) {
      alert("⚠️ El precio debe ser mayor a 0 y el stock no puede ser negativo.");
      return;
    }

    setLoading(true);
    if (form.ID) {
      await fetch(API_URL, { method: 'PUT', body: JSON.stringify(form) });
      alert("✅ Registro actualizado exitosamente");
    } else {
      await fetch(API_URL, { method: 'POST', body: JSON.stringify(form) });
      alert("✅ Registro guardado en la nube");
    }
    setForm({ ID: '', Nombre: '', Precio: '', Categoria: '', Stock: '' });
    fetchProductos();
  };

  const handleEdit = (prod) => setForm(prod);

  const handleDelete = async (ID) => {
    // ELIMINACIÓN CON CONFIRMACIÓN (Requisito cumplido)
    if (window.confirm("⚠️ ¿Estás seguro de que deseas eliminar este registro? Esta acción se reflejará en Google Sheets.")) {
      setLoading(true);
      await fetch(API_URL, { method: 'DELETE', body: JSON.stringify({ ID }) });
      fetchProductos();
    }
  };

  // FUNCIONALIDAD EXTRA A: Búsqueda
  const productosFiltrados = productos.filter(p => 
    p.Nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    p.Categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="crud-container">
      <header className="crud-header">
        <h2>Gestión de Inventario Cloud</h2>
        <button className="btn-logout" onClick={() => window.location.reload()}>Cerrar Sesión</button>
      </header>
      
      <div className="toolbar">
        <input 
          type="text" 
          className="search-bar"
          placeholder="🔍 Buscar por nombre o categoría..." 
          value={busqueda} 
          onChange={e => setBusqueda(e.target.value)} 
        />
        {/* FUNCIONALIDAD EXTRA E: Contador */}
        <div className="contador">
          Total de registros en Sheets: <strong>{productos.length}</strong>
        </div>
      </div>
      
      <div className="main-content">
        <div className="form-section">
          <h3>{form.ID ? 'Editar Registro' : 'Nuevo Registro'}</h3>
          <form onSubmit={handleSubmit} className="crud-form">
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" name="Nombre" value={form.Nombre} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Precio ($)</label>
              <input type="number" name="Precio" value={form.Precio} onChange={handleChange} required min="1" />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <input type="text" name="Categoria" value={form.Categoria} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input type="number" name="Stock" value={form.Stock} onChange={handleChange} required min="0" />
            </div>
            <button type="submit" className={`btn-submit ${form.ID ? 'btn-update' : ''}`} disabled={loading}>
              {loading ? 'Sincronizando...' : (form.ID ? 'Actualizar en la Nube' : 'Agregar a Google Sheets')}
            </button>
            {form.ID && (
              <button type="button" className="btn-cancel" onClick={() => setForm({ ID: '', Nombre: '', Precio: '', Categoria: '', Stock: '' })}>
                Cancelar Edición
              </button>
            )}
          </form>
        </div>

        <div className="table-section">
          {loading && productos.length === 0 ? <p className="loading">Cargando datos desde Google Sheets...</p> : (
            <table className="tabla-productos">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Categoría</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.length > 0 ? productosFiltrados.map((p, i) => (
                  <tr key={i}>
                    {/* Solo mostramos los últimos 4 dígitos del ID para que se vea limpio */}
                    <td className="id-cell">{p.ID ? p.ID.substring(p.ID.length - 4) : '...'}</td>
                    <td>{p.Nombre}</td>
                    <td>${p.Precio}</td>
                    <td><span className="badge">{p.Categoria}</span></td>
                    <td>{p.Stock}</td>
                    <td className="acciones">
                      <button onClick={() => handleEdit(p)} className="btn-icon edit">Editar</button>
                      <button onClick={() => handleDelete(p.ID)} className="btn-icon delete">Eliminar</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="empty-state">No se encontraron registros en la nube.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;