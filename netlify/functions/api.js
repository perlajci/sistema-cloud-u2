const { GoogleSpreadsheet } = require('google-spreadsheet');

exports.handler = async (event, context) => {
  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
    
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
    
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const method = event.httpMethod;

    // READ: Consultar registros
    if (method === 'GET') {
      const rows = await sheet.getRows();
      const data = rows.map(row => ({
        ID: row.ID, Nombre: row.Nombre, Precio: row.Precio, Categoria: row.Categoria, Stock: row.Stock
      }));
      return { statusCode: 200, body: JSON.stringify(data) };
    }

    // CREATE: Crear registro
    if (method === 'POST') {
      const data = JSON.parse(event.body);
      data.ID = Date.now().toString(); // Generar ID único
      await sheet.addRow(data);
      return { statusCode: 201, body: JSON.stringify({ message: "Creado" }) };
    }

    // UPDATE: Actualizar registro
    if (method === 'PUT') {
      const data = JSON.parse(event.body);
      const rows = await sheet.getRows();
      const rowToUpdate = rows.find(r => r.ID === data.ID);
      if(rowToUpdate) {
        rowToUpdate.Nombre = data.Nombre;
        rowToUpdate.Precio = data.Precio;
        rowToUpdate.Categoria = data.Categoria;
        rowToUpdate.Stock = data.Stock;
        await rowToUpdate.save();
        return { statusCode: 200, body: JSON.stringify({ message: "Actualizado" }) };
      }
    }

    // DELETE: Eliminar registro
    if (method === 'DELETE') {
      const { ID } = JSON.parse(event.body);
      const rows = await sheet.getRows();
      const rowToDelete = rows.find(r => r.ID === ID);
      if(rowToDelete) {
        await rowToDelete.delete();
        return { statusCode: 200, body: JSON.stringify({ message: "Eliminado" }) };
      }
    }

    return { statusCode: 400, body: "Método no soportado" };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};