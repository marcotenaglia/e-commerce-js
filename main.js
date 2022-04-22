class Producto {
    constructor(nombre, talle, precio, id, cantidad, imagen) {
        this.nombre = nombre;
        this.talle = talle;
        this.precio = precio;
        this.id = id;
        this.cantidad = cantidad;
        this.imagen = imagen;
    } 

    iva() {
        this.precio = parseFloat((this.precio * 1.20).toFixed(1));
    }
}

//array grupo contiene los objetos (ahora hardcodeados) pusheados
const grupo = [];

grupo.push(new Producto("Remera Azul", "", 3000, "1", 1, "imagenes/Azul.jpg"));
grupo.push(new Producto("Remera Roja", "", 5000, "2", 1, "imagenes/Roja.jpg"));
grupo.push(new Producto("Remera Verde", "", 4200, "3", 1, "imagenes/Verde.jpg"));
grupo.push(new Producto("Remera Negra", "", 5500, "4", 1, "imagenes/Negra.jpg"));
grupo.push(new Producto("Remera Celeste", "", 3500, "5", 1, "imagenes/Celeste.jpg"));
grupo.push(new Producto("Remera Blanca", "", 7000, "6", 1, "imagenes/Blanca.jpg"));

//se aplica el metodo iva para los productos con precio hardcodeado
for (let cadaUno of grupo) {
    cadaUno.iva();
}

for (const producto of grupo) {    
    let divProductos = document.createElement("div");
    divProductos.classList.add('caja-producto')
    divProductos.innerHTML =   `
                                <div id="producto">${producto.nombre}</div>
                                <img class="imagen" src="${producto.imagen}" alt="">
                                <div id="precio">$${producto.precio}</div>                                
                                <div>
                                  <select id="${producto.id}" class="talles">
                                    <option value="XS">XS</option>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                    <option value="XXL">XXL</option>
                                  </select>
                                  <button id="${producto.id}" class="btns">AÑADIR AL CARRITO</button></div>
                                </div>
                                `
    const divContenedor = document.getElementById("div-contenedor");
    divContenedor.appendChild(divProductos);    
}

let total = 0


let divTotalHijo = document.createElement("div")
divTotalHijo.innerHTML = `<br><br><br><br>TOTAL ${total}`
const divTotal = document.getElementById("total")
divTotal.append(divTotalHijo)

let carrito = []

let divCarrito = document.getElementById("div-carrito")

if ("carrito" in localStorage) {
    //array guardados toma lo que esta en local sorage (transformando de objeto literal a json)
    const guardados = JSON.parse(localStorage.getItem("carrito"))
    //con un for of pusheo cada uno de los elemenos (ahora json) como objetos 
    for (const generico of guardados) {
        carrito.push(new Producto(generico.nombre, generico.talle, generico.precio, generico.id, generico.cantidad, generico.imagen))        
    }
    //sobreescribir la variable total con una suma de todos los precios de cada objeto multiplicados por su cantidad
    total = carrito.reduce ((acumulador, elemento) => acumulador + elemento.precio*elemento.cantidad, 0);
    //se llama a la funcion que genera el html del carrito
    carritoHTML(carrito); 
    //se llama a la funcion que suma los precios multiplicados por la cantidad para tener el total
    sumarTotal(0)  
    confirmar()
}



//se modifican los botones de los objetos del array grupo para que al apretarlos cada uno se pushee al carrito (o si ya estan disparar sweet alert)
//(en este carrito decidi que el incremento de la cantidad del item (y en consecuencia del precio) se haga con el imput numerico y no apretando de nuevo el boton de agregar)
let botones = document.getElementsByClassName("btns")
for (const boton of botones) {
    boton.addEventListener("click", function () {
        let seleccion = grupo.find(e => e.id == this.id)

        //al objeto dentro de seleccion le cambio la propiedad talle por el valor que el usuario haya elegido desde el navegador. 
        seleccion.talle = document.getElementById(this.id).value;
        
        //si el objeto ya esta en el carrito disparar sweet alert
        if (carrito.find(e => e.id == seleccion.id))
            Swal.fire("Este elemento ya esta en el carrito.");   
        //en caso de que no esté, pushear seleccion, generar el html del carrito (lo que estaba antes mas lo que se sumo ahora), guardar todo lo que esta en el carrito en localstorago y sumar el total     
        else {
            nuevo = {...seleccion}
            carrito.push(nuevo)
            carritoHTML(carrito);
            localStorage.setItem("carrito", JSON.stringify(carrito))
            sumarTotal()    
            confirmar()
        }
    })
}

//funcion que crea el html de los objetos pusheados al carrito (items va a ser carrito)
function carritoHTML(items) {
    //reset de la veriable divCarrito por si ya fue usada.
    divCarrito.innerHTML=""
    divCarrito.classList.add('div-carrito')
    //para cada uno de los elementos crear un input numerico que modifique el precio subiendo o bajando la cantidad, posteriormente modificando el total
    for (const elemento of items) {
        let divCarritoItem = document.createElement("div");
        let input = document.createElement('input');
        input.type = 'number'
        input.min = 1
        input.max = 10
        input.classList.add('inputs')
        input.value = elemento.cantidad
        input.addEventListener("change", function() {            
            let span = this.parentElement.querySelector('span')
            elemento.cantidad = this.value
            span.innerText = elemento.precio * elemento.cantidad                    
            localStorage.setItem("carrito", JSON.stringify(carrito))
            totalInput = elemento.precio
            sumarTotal()
            confirmar()        
        })
        divCarritoItem.innerHTML=`<hr> ${elemento.nombre} <br> Talle ${elemento.talle} <br> <img class="imagen-carrito" src="${elemento.imagen}" alt=""> Precio $<span>${elemento.precio*elemento.cantidad}</span> `
        divCarritoItem.append(input)
        divCarrito.append(divCarritoItem);
    } 
}

//esta funcion vacia el carrito, recalcula el total (siendo que el carrito se vacia el total va a ser 0), borra el html del carrito y de la seleccion de ubicacion
function botonBorrarEvento(div) {    
    let botonBorrar = document.getElementById("delete-btn")
    botonBorrar.addEventListener("click", function () {
        carrito = []
        carritoHTML(carrito)
        sumarTotal()
        div.innerHTML = ""
        localStorage.setItem("carrito", JSON.stringify(carrito))        
    })
}

//utilice tanto then como async/await para llamadas asincronas a las apis de provincias y municipios de argentina
const fetchCall = async () => {
    const resp = await 
    fetch("https://apis.datos.gob.ar/georef/api/provincias")
    const datos = await resp.json()
    let divConfirm = document.getElementById("div-confirm")
    divConfirm.innerHTML = `<h3>Provincia</h3>
                <select id="provFiltro"></select>`
    let provFiltro = document.getElementById("provFiltro")
    for (const provincia of datos.provincias) {
        provFiltro.innerHTML += `<option value="${provincia.id}">${provincia.nombre}</option>`
    }
    let municipioDiv = document.createElement("div")
    divConfirm.appendChild(municipioDiv);    
        let idProvincia = provFiltro.value
        municipioDiv.innerHTML = ""
        municipioDiv.innerHTML = `<h3>Municipio</h3> 
                                  <select id="munFiltro"></select>`
        let rutaBusqueda = `https://apis.datos.gob.ar/georef/api/municipios?provincia=${idProvincia}&campos=id,nombre&max=100`
        fetch(rutaBusqueda)
            .then(response => response.json())
            .then(datos => {
                let munFiltro = document.getElementById("munFiltro")
                for (const municipio of datos.municipios) {
                    munFiltro.innerHTML += `<option value="${municipio.id}">${municipio.nombre}</option>`
                }})   
}

//funcion que genera el input para escribir la direccion especifica
function direccion() {
    let seleccionDireccion = document.getElementById("div-direccion")
    seleccionDireccion.innerHTML =      `<h3>Direccion</h3> 
                                         <input></input>
                                         <button id="btnEnvio">Enviar</button>`
}


//esta funcion suma los precios multiplicados por su cantidad para imprimir en el html el total actualizado
function sumarTotal() {
    total = carrito.reduce((acumulador, elemento) => acumulador + elemento.precio * elemento.cantidad, 0);
    divTotalHijo.innerHTML = `<br><br><br><br>TOTAL $${total} <br><br> 
                              <button id="confirm-btn">CONFIRMAR</button>
                              <button id="delete-btn">VACIAR CARRITO</button>`


}
/*Esta funcion actua sobre los botones confirmar y borrar.
Al clickear confirmar (si el carrito tiene algo) se llama asincronicamente a la funcion que hace el fetch de provincias y municipios y a la que genera el input para la direccion.
A su vez, al presionarlo se activa la funcion del boton borrar (esto es para que el boton borrar tambien elimine lo que ya printeó el boton confirmar)*/
function confirmar() {    
    let confirmBtn = document.getElementById("confirm-btn")
    let divConfirm = document.getElementById("div-confirm")
    let divDireccion = document.getElementById("div-direccion")

    botonBorrarEvento(divConfirm)
    botonBorrarEvento(divDireccion)
    confirmBtn.addEventListener("click", async () => {
        if (total != 0) {
            await fetchCall()
            direccion()
            divDireccion.scrollIntoView({behavior: 'smooth'})
        }
})
}



