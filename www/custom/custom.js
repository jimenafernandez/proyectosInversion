var contenidoJSON;
var address;


function myFunction() {
    document.getElementById("myDialog").open = true;
}

function volverParaAtras(){
    mui.viewport.showPage("home-page", "SLIDE_RIGHT");
}

function CrearONG(){
    mui.viewport.showPage("home-page", "SLIDE_LEFT");
}

function ingresarDonador(){
    mui.viewport.showPage("template-page-4", "SLIDE_RIGHT");
}

function aceptarPalabra(){
    mui.viewport.showPage("template-page-2", "SLIDE_LEFT");
    var palabra = document.getElementById("campoPalabra");
    console.log(palabra.value);
    createAddress(palabra.value);
}

function ingresarONG(){
    mui.viewport.showPage("template-page-3", "SLIDE_RIGHT");
}

function enviar(){
	document.getElementById("myDialog").open = false;
}

function cancelar(){
    document.getElementById("myDialog").open = false;
}

