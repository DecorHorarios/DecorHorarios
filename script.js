// Configuración de la API de Google
const CLIENT_ID = '716545872817-3qv9mbp1ek8ul7aqfotnrot7d49j5lu9.apps.googleusercontent.com';
const API_KEY = 'AIzaSyD0J-v2Ysk5-cNbkCuuRJ2EANGd4W_t038';
const SHEET_ID = '1pWKulIIQ3PLH6uIEp18ojKsLA_CwSukqt6dgUzp5lfs';
const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

// Autenticación de Google
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(() => {
        const authInstance = gapi.auth2.getAuthInstance();
        authInstance.isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(authInstance.isSignedIn.get());
        document.getElementById('login').onclick = () => authInstance.signIn();
        document.getElementById('logout').onclick = () => authInstance.signOut();
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        document.getElementById('login').style.display = 'none';
        document.getElementById('logout').style.display = 'block';
        cargarHorarios();
    } else {
        document.getElementById('login').style.display = 'block';
        document.getElementById('logout').style.display = 'none';
    }
}

// Cargar horarios desde Google Sheets
function cargarHorarios() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Horarios!A2:E'
    }).then(response => {
        const rows = response.result.values;
        const tbody = document.getElementById('tabla-horarios').querySelector('tbody');
        tbody.innerHTML = '';
        rows.forEach((fila, index) => {
            let tr = document.createElement('tr');
            fila.forEach(columna => {
                let td = document.createElement('td');
                td.textContent = columna;
                tr.appendChild(td);
            });
            // Botones de Editar y Eliminar
            let tdAcciones = document.createElement('td');
            tdAcciones.innerHTML = `<button onclick="editarHorario(${index + 2})">Editar</button>
                                   <button onclick="eliminarHorario(${index + 2})">Eliminar</button>`;
            tr.appendChild(tdAcciones);
            tbody.appendChild(tr);
        });
    });
}

// Agregar un nuevo horario
document.getElementById('form-horario').addEventListener('submit', e => {
    e.preventDefault();
    const datos = [
        document.getElementById('dia').value,
        document.getElementById('inicio').value,
        document.getElementById('fin').value,
        document.getElementById('descripcion').value,
        document.getElementById('semana').value
    ];

    gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: 'Horarios!A2:E2',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: { values: [datos] }
    }).then(() => {
        alert('Horario agregado con éxito');
        cargarHorarios();
        limpiarFormulario();
    });
});

// Editar un horario
function editarHorario(fila) {
    const nuevosDatos = prompt('Ingresa los nuevos datos separados por comas: Día,Inicio,Fin,Descripción,Semana');
    if (nuevosDatos) {
        const valores = nuevosDatos.split(',');
        gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `Horarios!A${fila}:E${fila}`,
            valueInputOption: 'RAW',
            resource: { values: [valores] }
        }).then(() => {
            alert('Horario editado con éxito');
            cargarHorarios();
        });
    }
}

// Eliminar un horario
function eliminarHorario(fila) {
    gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        resource: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: 0,
                        dimension: 'ROWS',
                        startIndex: fila - 1,
                        endIndex: fila
                    }
                }
            }]
        }
    }).then(() => {
        alert('Horario eliminado con éxito');
        cargarHorarios();
    });
}

// Cargar la API al abrir la página
window.onload = handleClientLoad;

// Código adicional para funcionalidades
function mostrarSemana(semana) {
    document.getElementById('semana-actual').classList.add('hidden');
    document.getElementById('semana-siguiente').classList.add('hidden');
    document.getElementById(`semana-${semana}`).classList.remove('hidden');
}

function verificarClave() {
    let clave = document.getElementById("clave").value;
    if (clave === "mimamamemima") {
        document.getElementById("borrar").classList.remove("hidden");
        alert("Clave correcta. Puedes modificar o borrar horarios.");
    } else {
        alert("Clave incorrecta.");
    }
}

function limpiarFormulario() {
    document.getElementById('form-horario').reset();
}
