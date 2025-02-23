let claveCorrecta = "mimamamemima";
let claveIngresada = false;

// Cargar los horarios desde el localStorage al cargar la página
window.onload = function() {
    inicializarHoras();
    inicializarTabla("tabla-actual");
    inicializarTabla("tabla-siguiente");
    cargarHorarios();
};

// Mostrar la semana seleccionada (actual o siguiente)
function mostrarSemana(semana) {
    document.getElementById('semana-actual').classList.add('hidden');
    document.getElementById('semana-siguiente').classList.add('hidden');
    document.getElementById(`semana-${semana}`).classList.remove('hidden');
}

// Verificar clave de edición
function verificarClave() {
    let clave = document.getElementById("clave").value;
    if (clave === claveCorrecta) {
        claveIngresada = true;
        document.getElementById("borrar").classList.remove("hidden");
        document.getElementById("boton-cambiar").classList.remove("hidden");  // Mostrar el botón "Cambiar Semana"
        alert("Clave correcta. Ahora puedes modificar o borrar horarios.");
    } else {
        alert("Clave incorrecta.");
    }
}

// Inicializar las horas en los selects de hora de inicio y fin
function inicializarHoras() {
    let horaInicio = document.getElementById("hora-inicio");
    let horaFin = document.getElementById("hora-fin");
    for (let i = 8; i <= 18; i++) {
        let hora = (i <= 12 ? i : i - 12) + (i < 12 ? " AM" : " PM");
        horaInicio.innerHTML += `<option value="${i}">${hora}</option>`;
        horaFin.innerHTML += `<option value="${i}">${hora}</option>`;
    }
}

// Inicializar las tablas (semana actual y semana siguiente)
function inicializarTabla(idTabla) {
    let tabla = document.getElementById(idTabla);
    // Si la tabla ya tiene filas (es decir, si no está vacía), no hacer nada
    if (tabla.rows.length > 1) return; // Si ya está inicializada, no la volvemos a inicializar

    for (let i = 8; i <= 18; i++) {
        let fila = tabla.insertRow();
        let celdaHora = fila.insertCell(0);
        celdaHora.textContent = (i <= 12 ? i : i - 12) + (i < 12 ? " AM" : " PM");
        for (let j = 1; j <= 6; j++) {
            fila.insertCell(j).setAttribute("data-ocupado", "false");
        }
    }
}

// Agregar un horario al seleccionar un horario y guardar en localStorage
function agregarHorario() {
    let dia = document.getElementById("dia").value;
    let inicio = document.getElementById("hora-inicio").value;
    let fin = document.getElementById("hora-fin").value;
    let descripcion = document.getElementById("descripcion").value;
    let semanaSeleccionada = document.getElementById("seleccion-semana").value;
    let tabla = document.getElementById(`tabla-${semanaSeleccionada}`);
    let inicioIdx = parseInt(inicio) - 8;
    let finIdx = parseInt(fin) - 8;
    let ocupado = false;

    // Comprobar si ya está ocupado el horario
    for (let i = inicioIdx; i <= finIdx; i++) {
        if (tabla.rows[i + 1].cells[dia].getAttribute("data-ocupado") === "true") {
            ocupado = true;
        }
    }

    if (ocupado) {
        alert("Lo sentimos, el horario seleccionado ya está ocupado. Por favor, intenta con otro horario.");
    } else {
        // Asignar el horario a las celdas seleccionadas
        for (let i = inicioIdx; i <= finIdx; i++) {
            let celda = tabla.rows[i + 1].cells[dia];
            celda.textContent = descripcion;
            celda.classList.add("occupied");
            celda.setAttribute("data-ocupado", "true");
        }
        // Guardar cambios en localStorage
        guardarHorarios();
    }
}

// Función para guardar los horarios en localStorage
function guardarHorarios() {
    let horarios = {};
    let semanas = ['actual', 'siguiente'];

    // Guardar las dos semanas en el localStorage
    semanas.forEach(semana => {
        let tabla = document.getElementById(`tabla-${semana}`);
        let horariosSemana = [];

        for (let i = 1; i < tabla.rows.length; i++) {
            let fila = tabla.rows[i];
            let filaHorarios = [];
            for (let j = 1; j <= 6; j++) {
                let celda = fila.cells[j];
                filaHorarios.push({
                    texto: celda.textContent,
                    ocupado: celda.getAttribute("data-ocupado") === "true"
                });
            }
            horariosSemana.push(filaHorarios);
        }
        horarios[semana] = horariosSemana;
    });

    localStorage.setItem("horarios", JSON.stringify(horarios));
}

// Función para cargar los horarios desde localStorage
function cargarHorarios() {
    let horarios = JSON.parse(localStorage.getItem("horarios"));
    if (horarios) {
        ['actual', 'siguiente'].forEach(semana => {
            let tabla = document.getElementById(`tabla-${semana}`);
            horarios[semana].forEach((filaHorarios, i) => {
                let fila = tabla.rows[i + 1];
                filaHorarios.forEach((horario, j) => {
                    let celda = fila.cells[j + 1];
                    celda.textContent = horario.texto;
                    if (horario.ocupado) {
                        celda.classList.add("occupied");
                        celda.setAttribute("data-ocupado", "true");
                    }
                });
            });
        });
    }
}

// Función para borrar el horario seleccionado
function borrarHorario() {
    let semanaSeleccionada = document.getElementById("seleccion-semana").value;
    let dia = document.getElementById("dia").value;
    let inicio = document.getElementById("hora-inicio").value;
    let fin = document.getElementById("hora-fin").value;
    let tabla = document.getElementById(`tabla-${semanaSeleccionada}`);
    let inicioIdx = parseInt(inicio) - 8;
    let finIdx = parseInt(fin) - 8;

    // Borrar el horario de las celdas seleccionadas
    for (let i = inicioIdx; i <= finIdx; i++) {
        let celda = tabla.rows[i + 1].cells[dia];
        celda.textContent = "";
        celda.classList.remove("occupied");
        celda.setAttribute("data-ocupado", "false");
    }

    // Guardar cambios en localStorage
    guardarHorarios();
}

// Función para cambiar de semana (de la semana actual a la siguiente)
function cambiarSemana() {
    let tablaActual = document.getElementById("tabla-actual");
    let tablaSiguiente = document.getElementById("tabla-siguiente");

    // Copiar las celdas de la semana siguiente a la actual
    for (let i = 1; i < tablaActual.rows.length; i++) {
        for (let j = 1; j <= 6; j++) {
            tablaActual.rows[i].cells[j].textContent = tablaSiguiente.rows[i].cells[j].textContent;
            tablaActual.rows[i].cells[j].setAttribute("data-ocupado", tablaSiguiente.rows[i].cells[j].getAttribute("data-ocupado"));
            if (tablaSiguiente.rows[i].cells[j].classList.contains("occupied")) {
                tablaActual.rows[i].cells[j].classList.add("occupied");
            }
        }
    }

    // Vaciar la semana siguiente
    for (let i = 1; i < tablaSiguiente.rows.length; i++) {
        for (let j = 1; j <= 6; j++) {
            tablaSiguiente.rows[i].cells[j].textContent = "";
            tablaSiguiente.rows[i].cells[j].classList.remove("occupied");
            tablaSiguiente.rows[i].cells[j].setAttribute("data-ocupado", "false");
        }
    }

    // Guardar cambios en localStorage después de cambiar la semana
    guardarHorarios();
}
