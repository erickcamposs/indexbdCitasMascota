
const mascotaInput = document.querySelector('#mascota');
const propietarioInput = document.querySelector('#propietario');
const telefonoInput = document.querySelector('#telefono');
const fechaInput = document.querySelector('#fecha');
const horaInput = document.querySelector('#hora');
const sintomasInput = document.querySelector('#sintomas');

// Contenedor para las citas
const contenedorCitas = document.querySelector('#citas');

// Formulario nuevas citas
const formulario = document.querySelector('#nueva-cita')
formulario.addEventListener('submit', nuevaCita);

// Heading
const heading = document.querySelector('#administra');
let DB;

let editando = false;

window.onload = () => {
    eventListeners();
    crearDB();
}
// Eventos

function eventListeners() {
    mascotaInput.addEventListener('change', datosCita);
    propietarioInput.addEventListener('change', datosCita);
    telefonoInput.addEventListener('change', datosCita);
    fechaInput.addEventListener('change', datosCita);
    horaInput.addEventListener('change', datosCita);
    sintomasInput.addEventListener('change', datosCita);
}

const citaObj = {
    mascota: '',
    propietario: '',
    telefono: '',
    fecha: '',
    hora:'',
    sintomas: ''
}


function datosCita(e) {
    //  console.log(e.target.name) // Obtener el Input
     citaObj[e.target.name] = e.target.value;
}

// CLasses
class Citas {
    constructor() {
        this.citas = []
    }
    agregarCita(cita) {
        this.citas = [...this.citas, cita];
    }
    editarCita(citaActualizada) {
        this.citas = this.citas.map( cita => cita.id === citaActualizada.id ? citaActualizada : cita)
    }

    eliminarCita(id) {
        this.citas = this.citas.filter( cita => cita.id !== id);
    }
}

class UI {

    constructor({citas}) {
        this.textoHeading(citas);
    }

    imprimirAlerta(mensaje, tipo) {
        // Crea el div
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert', 'd-block', 'col-12');
        
        // Si es de tipo error agrega una clase
        if(tipo === 'error') {
             divMensaje.classList.add('alert-danger');
        } else {
             divMensaje.classList.add('alert-success');
        }

        // Mensaje de error
        divMensaje.textContent = mensaje;

        // Insertar en el DOM
        document.querySelector('#contenido').insertBefore( divMensaje , document.querySelector('.agregar-cita'));

        // Quitar el alert despues de 3 segundos
        setTimeout( () => {
            divMensaje.remove();
        }, 3000);
   }

   imprimirCitas() { // Se puede aplicar destructuring desde la función...
       
        this.limpiarHTML();

        this.textoHeading(citas);

        //Leer el contenido de la base de datos
        const objectStore = DB.transaction('citas').objectStore('citas');

        const textHeading = this.textoHeading;
        const total = objectStore.count();
        total.onsuccess = function(){
            textHeading(total.result);
        }

        objectStore.openCursor().onsuccess = function(e){

            const cursor = e.target.result;
            if(cursor){
                const {mascota, propietario, telefono, fecha, hora, sintomas, id} = cursor.value;
                const divCita = document.createElement('DIV');
                divCita.classList.add('cita', 'p-3');
                divCita.dataset.id = id;

                //Scripting
                const mascotaParrafo = document.createElement('H2');
                mascotaParrafo.classList.add('card-title', 'font-weight-bolder');
                mascotaParrafo.textContent = mascota;

                const propietarioParrafo = document.createElement('P');
                propietarioParrafo.innerHTML = `
                    <span class = "font-weight-bolder">Propietario: </span> ${propietario}
                `;

                const telefonoParrafo = document.createElement('P');
                telefonoParrafo.innerHTML = `
                    <span class = "font-weight-bolder">Teléfono: </span> ${telefono}
                `;

                const fechaParrafo = document.createElement('P');
                fechaParrafo.innerHTML = `
                    <span class = "font-weight-bolder">Fecha: </span> ${fecha}
                `;

                const horaParrafo = document.createElement('P');
                horaParrafo.innerHTML = `
                    <span class = "font-weight-bolder">Hora: </span> ${hora}
                `;

                const sintomasParrafo = document.createElement('P');
                sintomasParrafo.innerHTML = `
                    <span class = "font-weight-bolder">Sintomas: </span> ${sintomas}
                `;
                //Boton Eliminar
                const btnEliminar = document.createElement('BUTTON');
                btnEliminar.classList.add('btn', 'btn-danger', 'mr-2');
                btnEliminar.innerHTML = 'Eliminar <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
                btnEliminar.onclick = () => {
                    eliminarCita(id);
                }

                //Boton Eliminar
                const btnEditar = document.createElement('BUTTON');
                btnEditar.classList.add('btn', 'btn-info', 'mr-2');
                btnEditar.innerHTML = ' Editar <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>';
                const cita = cursor.value;
                btnEditar.onclick = () => {
                    cargarEdicion(cita);
                }

                divCita.appendChild(mascotaParrafo);
                divCita.appendChild(propietarioParrafo);
                divCita.appendChild(telefonoParrafo);
                divCita.appendChild(fechaParrafo);
                divCita.appendChild(horaParrafo);
                divCita.appendChild(sintomasParrafo);
                divCita.appendChild(btnEliminar);
                divCita.appendChild(btnEditar);

                contenedorCitas.appendChild(divCita);

                //Ve al siguiente elemento
                cursor.continue();
            }
        }
            
   }

   textoHeading(resultado) {
        if(resultado > 0 ) {
            heading.textContent = 'Administra tus Citas '
        } else {
            heading.textContent = 'No hay Citas, comienza creando una'
        }
    }

   limpiarHTML() {
        while(contenedorCitas.firstChild) {
            contenedorCitas.removeChild(contenedorCitas.firstChild);
        }
   }
}


const administrarCitas = new Citas();
const ui = new UI(administrarCitas);

function nuevaCita(e) {
    e.preventDefault();

    const {mascota, propietario, telefono, fecha, hora, sintomas } = citaObj;

    // Validar
    if( mascota === '' || propietario === '' || telefono === '' || fecha === ''  || hora === '' || sintomas === '' ) {
        ui.imprimirAlerta('Todos los mensajes son Obligatorios', 'error')

        return;
    }

    if(editando) {
        // Estamos editando
        administrarCitas.editarCita( {...citaObj} );

        //Editar en el IndexDb
        const transsaccion = DB.transaction(['citas'], 'readwrite');
        const objectStore = transsaccion.objectStore('citas');

        objectStore.put(citaObj);

        transsaccion.oncomplete = function(){
            ui.imprimirAlerta('Guardado Correctamente');
            formulario.querySelector('button[type="submit"]').textContent = 'Crear Cita';

            editando = false;
        }
        transsaccion.onerror = function(){
            console.log('Hubo un error');
        }
        

    } else {
        // Nuevo Registro
        // Generar un ID único
        citaObj.id = Date.now();
        
        // Añade la nueva cita
        administrarCitas.agregarCita({...citaObj});

        //Insertar en IndexDB
        const transaccion = DB.transaction(['citas'], 'readwrite');
        const objectStore = transaccion.objectStore('citas');
        objectStore.add(citaObj);
        transaccion.oncomplete = function(){
            // Mostrar mensaje de que todo esta bien...
            ui.imprimirAlerta('Se agregó correctamente')
        }
    }


    // Imprimir el HTML de citas
    ui.imprimirCitas();

    // Reinicia el objeto para evitar futuros problemas de validación
    reiniciarObjeto();

    // Reiniciar Formulario
    formulario.reset();

}

function reiniciarObjeto() {
    // Reiniciar el objeto
    citaObj.mascota = '';
    citaObj.propietario = '';
    citaObj.telefono = '';
    citaObj.fecha = '';
    citaObj.hora = '';
    citaObj.sintomas = '';
}


function eliminarCita(id) {
    const transaccion = DB.transaction(['citas'], 'readwrite');
    const objectStore = transaccion.objectStore('citas');
    objectStore.delete(id);

    transaccion.oncomplete = function(){
        console.log(`Cita ${id} eliminada`);
        ui.imprimirCitas()
    }
    transaccion.onerror = function(){
        console.log('Hubo un error');
    }
}

function cargarEdicion(cita) {

    const {mascota, propietario, telefono, fecha, hora, sintomas, id } = cita;

    // Reiniciar el objeto
    citaObj.mascota = mascota;
    citaObj.propietario = propietario;
    citaObj.telefono = telefono;
    citaObj.fecha = fecha
    citaObj.hora = hora;
    citaObj.sintomas = sintomas;
    citaObj.id = id;

    // Llenar los Inputs
    mascotaInput.value = mascota;
    propietarioInput.value = propietario;
    telefonoInput.value = telefono;
    fechaInput.value = fecha;
    horaInput.value = hora;
    sintomasInput.value = sintomas;

    formulario.querySelector('button[type="submit"]').textContent = 'Guardar Cambios';

    editando = true;

}
function crearDB(){
    const citasDB = window.indexedDB.open('citas', 1);

    citasDB.onerror = function(){
        console.log('Hubo un error');
    }
    citasDB.onsuccess = function(){
        DB = citasDB.result;
        //Mostrar citas al cargar IndexDB
        ui.imprimirCitas()
    }
    citasDB.onupgradeneeded = function(e){
        const db = e.target.result;
        const objectStore = db.createObjectStore('citas',{
            keyPath: 'id',
            autoIncrement: true
        });
        //Definir todas las columnas
        objectStore.createIndex('mascota', 'mascota', {unique: false});
        objectStore.createIndex('propietario', 'propietario', {unique: false});
        objectStore.createIndex('telefono', 'telefono', {unique: false});
        objectStore.createIndex('fecha', 'fecha', {unique: false});
        objectStore.createIndex('hora', 'hora', {unique: false});
        objectStore.createIndex('sintomas', 'sintomas', {unique: false});
        objectStore.createIndex('id', 'id', {unique: true});
    }   
}
