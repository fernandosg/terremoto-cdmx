
$.extend($.easing,
{
    def: 'easeOutQuad',
    easeInOutExpo: function (x, t, b, c, d) {
        if (t==0) return b;
        if (t==d) return b+c;
        if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
        return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
    }
});

(function( $ ) {

    var settings;
    var disableScrollFn = false;
    var navItems;
    var navs = {}, sections = {};

    $.fn.navScroller = function(options) {
        settings = $.extend({
            scrollToOffset: 170,
            scrollSpeed: 800,
            activateParentNode: true,
        }, options );
        navItems = this;

        //attatch click listeners
    	navItems.on('click', function(event){
    		event.preventDefault();
            var navID = $(this).attr("href").substring(1);
            disableScrollFn = true;
            activateNav(navID);
            populateDestinations(); //recalculate these!
        	$('html,body').animate({scrollTop: sections[navID] - settings.scrollToOffset},
                settings.scrollSpeed, "easeInOutExpo", function(){
                    disableScrollFn = false;
                }
            );
    	});

        //populate lookup of clicable elements and destination sections
        populateDestinations(); //should also be run on browser resize, btw

        // setup scroll listener
        $(document).scroll(function(){
            if (disableScrollFn) { return; }
            var page_height = $(window).height();
            var pos = $(this).scrollTop();
            for (i in sections) {
                if ((pos + settings.scrollToOffset >= sections[i]) && sections[i] < pos + page_height){
                    activateNav(i);
                }
            }
        });
    };

    function populateDestinations() {
        navItems.each(function(){
            var scrollID = $(this).attr('href').substring(1);
            navs[scrollID] = (settings.activateParentNode)? this.parentNode : this;
            sections[scrollID] = $(document.getElementById(scrollID)).offset().top;
        });
    }

    function activateNav(navID) {
        for (nav in navs) { $(navs[nav]).removeClass('active'); }
        $(navs[navID]).addClass('active');
    }
})( jQuery );


$(document).ready(function (){

    $('nav li a').navScroller();

    //section divider icon click gently scrolls to reveal the section
	$(".sectiondivider").on('click', function(event) {
    	$('html,body').animate({scrollTop: $(event.target.parentNode).offset().top - 50}, 400, "linear");
	});

    //links going to other sections nicely scroll
	$(".container a").each(function(){
        if ($(this).attr("href").charAt(0) == '#'){
            $(this).on('click', function(event) {
        		event.preventDefault();
                var target = $(event.target).closest("a");
                var targetHight =  $(target.attr("href")).offset().top
            	$('html,body').animate({scrollTop: targetHight - 170}, 800, "easeInOutExpo");
            });
        }
	});

  function enviarFormularioReporteDano(){
    console.log($("select#ciudad").val()+" "+$("select#municipio").val());
    $.ajax({
      method:"POST",
      url:"https://terremoto-zonariesgo-cdmx.herokuapp.com/reporte_danos",
      data:{reporte_dano:{
        tipo_dano_id:$("select#tipo_dano").val(),
        calle:$("input#calle").val(),
        numero_exterior:$("input#numero_exterior").val(),
        codigo_postal:$("input#codigo_postal").val(),
        entre_calles:$("input#entre_calles").val(),
        personas_heridas_fallecidas:$("input#personas_heridas_fallecidas").val(),
        personas_afectadas:$("input#personas_afectadas").val(),
        apoyo_necesario:$("textarea#apoyo_necesario").val(),
        informacion_extra:$("textarea#informacion_extra").val(),
        informacion_contacto:$("textarea#informacion_contacto").val(),
        ciudad_id:$("select#ciudad").val(),
        municipio_id:$("select#municipio").val()
      }}
    }).done(function(){
      alert("Envio de reporte enviado con exito");
      dialog.dialog( "close" );
    }).fail(function(){
      console.log("Fallo en el envio de datos");
    })
  }

   function obtenerInformacionFormulario(){
     $.ajax({
       method:"GET",
       url:"https://terremoto-zonariesgo-cdmx.herokuapp.com/datos/obtener-informacion-formulario",
       datatype:"JSON"
     }).done(function(jsonInfo){
       var listaCiudades="",listaMunicipios="",listaTipoDano="";
       for(var i=0,length=jsonInfo.ciudades.length;i<length;i++){
         listaCiudades+="<option value="+jsonInfo.ciudades[i].id+">"+jsonInfo.ciudades[i].nombre+"</option>";
       }
       for(var i=0,length=jsonInfo.municipios.length;i<length;i++){
         listaMunicipios+="<option value="+jsonInfo.municipios[i].id+">"+jsonInfo.municipios[i].nombre+"</option>";
       }

       for(var i=0,length=jsonInfo.tipo_dano.length;i<length;i++){
         listaMunicipios+="<option value="+jsonInfo.municipios[i].id+">"+jsonInfo.municipios[i].nombre+"</option>";
       }
       $("select#ciudad").html(listaCiudades);
       $("select#municipio").html(listaMunicipios);
       $("select#tipo_dano").html(tipo_dano);
     }).fail(function(){
       alert("Problema al cargar las ciudades y municipios");
     })
   }

   $(document).on("click","#registrar_zona",function(event){
     dialog.dialog( "open" );
     //obtenerInformacionFormulario();
   });

   dialog = $( "#dialog-form" ).dialog({
      autoOpen: false,
      height: 400,
      width: 350,
      modal: true,
      buttons: {
        "Enviar formulario": function(){
          enviarFormularioReporteDano();
        },
        Cancel: function() {
          dialog.dialog( "close" );
        }
      },
      close: function() {
        form[ 0 ].reset();
        allFields.removeClass( "ui-state-error" );
      }
    });


});
