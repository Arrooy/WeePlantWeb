var animationSpeed = 600;
var titleSize = 120;
var titleResizedSize = 45;
var scrollNeeded = 20;

var socket = io();

var stopAll = false;

var topBarON = false;
var lastCase = '1';

var secondsGone = 0;
var inactividad = true;

var scrollIsReady = true;

var initSlider = true;

var cIndex = 4;
var imgIndex = 3;
var imgDir = 1;
var lateralSpeed = 750;
var ready = true;

var oneTime = true;

var firstTime = true;

var currentIdioma = 1;
var idiomasTriggered = false;
var weNeedAnUpadte = false;
var offsetInit = 0;
var phoneOn = false;
var w = window,
  d = document,
  e = d.documentElement,
  g = d.getElementsByTagName('body')[0],
  xSize = w.innerWidth || e.clientWidth || g.clientWidth,
  ySize = w.innerHeight || e.clientHeight || g.clientHeight;

if(xSize < 600 || ySize < 520){
  document.location.href = "phone";
  phoneOn = true;
}else if(phoneOn){
  document.location.href = "";
  phoneOn = false;
}


$(document).ready(function() {

  activateHelper = xSize > 850;

  if(ySize >= 900){
     titleSize = 120;
     $("#titleImage").css("height","120px");
  }else{
    titleSize = 80;
    $("#titleImage").css("height","80px");
  }

  startImages();
  $("#1").toggleClass('onZone');
  $("#q1").css("opacity", "1");

  w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    xSize = w.innerWidth || e.clientWidth || g.clientWidth,
    ySize = w.innerHeight || e.clientHeight || g.clientHeight;

  $(".idiomaContainer").children().on('click', function() {
      weNeedAnUpadte = true;
      currentIdioma = this.id.substring(1);
  })


    $(".idiomaContainer").children().hover(function() {


    $(this).css("opacity", "1");$(this).css("color", "red");
  }, function() {
    $(this).css("opacity", "1");
    $(this).css("color", "#e4e4e4");
  });

  $(".lateralLButton").hover(function() {
    $(this).css("opacity", "0.5");
  }, function() {
    $(this).css("opacity", "0");
  });

  $(".lateralRButton").hover(function() {
    $(this).css("opacity", "0.5");
  }, function() {
    $(this).css("opacity", "0");
  });

  $(".scrollBar").children().on('click', function() {

    currentPage = this.id;
    gestionaScroll(this);
  });

  $(".mainTitle2").on('click', function() {
    gestionaScroll($("#1")[0]);
    currentPage = 0;
  });

  var oneTimeL = true;
  var oneTimeR = true;

  $(".lateralLButton").on('click', function() {

    if (ready && imgIndex != 1){

       inactividad = false;
       secondsGone = 0;

       nextFoto(true);
       imgIndex--;
       imgDir = -1;
    }
  });

  $(".lateralRButton").on('click', function() {
    if (ready && imgIndex != 7){

      inactividad = false;
      secondsGone = 0;

      nextFoto(false);
      imgIndex++;
      imgDir = 1;
    }
  });

  $("#f5").on('click',function(){
    submitForm();
  });

  setInterval(function() {
    xSize = w.innerWidth || e.clientWidth || g.clientWidth;
    ySize = w.innerHeight || e.clientHeight || g.clientHeight;

    if (oneTime) {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      oneTime = false;
    }

    if (weNeedAnUpadte) {
      variaIdioma();
      weNeedAnUpadte = false;
    }
  }, 1000 / 50);

  setInterval (function() {

    if(inactividad && ready){

      oneTimeL = true;
      oneTimeR = true;

      imgIndex += imgDir;

      if (imgIndex >= 8) {
        imgDir *= -1;
        imgIndex -= 2;
      }

      if (imgIndex < 1) {
        imgDir *= -1;
        imgIndex += 2;
      }

      if (imgDir > 0) {
        nextFoto(false);
      } else {
        nextFoto(true);
      }

    }else{

      secondsGone += 1;
      if(secondsGone >= 2){
        inactividad = true;
        secondsGone = 0;
      }
    }
  }, 3500);

  offsetInit = $('#navbar').offset().top;

  $(".arrow").on("click",function(){
    gestionaScroll($("#2")[0]);
  });
  $(".arrow2").on("click",function(){
    gestionaScroll($("#4")[0]);
  });

  if(activateHelper){
    $(".scrollBar").children().hover(function() {
      scrollOver();
      $(".scrollBarHelper").children().css("opacity", "0.5");
      $("#q" + this.id).css("opacity", "1");
    });


    $(".scrollBarHelper").children().on('click', function() {
      var id = this.id.substring(1);
      currentPage = id;
      gestionaScroll($("#" + id)[0]);
    });


    $(".scrollBarHelper2").children().on('click', function() {
      var id = this.id.substring(1);
      currentPage = id;
      gestionaScroll($("#" + id)[0]);
    });

    $(".scrollBarHelper2").children().hover(function() {
      scrollOver();
      $(".scrollBarHelper").children().css("opacity", "0.5");
      $("#q" + (this.id.substring(1))).css("opacity", "1");
    });

    $(".scrollBarHelper").children().hover(function() {
      scrollOver();
      $(".scrollBarHelper").children().css("opacity", "0.5");
      $(this).css("opacity", "1");
    });

    $(".HotZone").hover(function() {
      if (!stopAll) scrollOver();
    }, function() {
      scrollNotOver();
    });
  }else{
    $(".HotZone").css("display", "none");
    $(".scrollBarHelper").css("display", "none");
    $(".scrollBarHelper2").css("display", "none");
  }
});

$(window).bind('resize', function(e)
{
  if (window.RT) clearTimeout(window.RT);
  window.RT = setTimeout(function()
  {
    this.location.reload(false); /* false to get page from cache */
  }, 100);
});

window.onload = function() {
  oneTime = true;
};

var one = true;
var dos = true;

var scrollDown = 0;
var scrollUp = 0;

var currentPage = 1;

$(window).bind('mousewheel DOMMouseScroll', function(event) {

  if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
    // scroll up
    scrollUp++;
    scrollDown = 0;

    if (scrollUp >= scrollNeeded) {
      currentPage--;
      if (currentPage <= 1) {
        currentPage = 1;
      }
      gestionaScroll($('#' + currentPage)[0]);
      scrollUp = 0;
    }

  } else {
    // scroll down
    scrollDown++;
    scrollUp = 0;

    if (scrollDown >= scrollNeeded) {
      currentPage++;
      if (currentPage >= 6) currentPage = 6;
      gestionaScroll($('#' + currentPage)[0]);
      scrollDown = 0;
    }
  }

  if (window.pageYOffset >= offsetInit) {
    navbar.classList.add("sticky");
  } else {
    navbar.classList.remove("sticky");
  }

});

var topBarActivated = function() {
  $(".mainTitle").css("display", "none");
  $(".mainTitle2").css("display", "block");
  navbar.classList.add("sticky");
}

var gestionaScroll = function(elemento) {
  if(scrollIsReady){
    scrollNotOver();
    if (elemento.id === "3") {
      $(".scrollBar").css("display", "none");
      $(".HotZone").css("display", "none");
      $(".scrollBarHelper").css("display", "none");
      $(".scrollBarHelper2").css("display", "none");
      stopAll = true;

    } else {

        $(".scrollBar").css("display", "block");
      if(activateHelper){
        $(".HotZone").css("display", "block");
        $(".scrollBarHelper").css("display", "block");
        $(".scrollBarHelper2").css("display", "block");
      }
      stopAll = false;
    }
    switch (elemento.id) {
      case '2':

        $(".mainTitle").css("font-size", titleSize + "px");
        $("#titleImage").css("height",titleSize +"px");
        $(".arrow").css("display","none");

        $(".mainTitle").css("top", "50%");
        if (lastCase === '1') {
          $(".mainTitle").animate({
            top: ySize + 40,
            fontSize: titleResizedSize + 'px'
          }, animationSpeed, "swing", function() {
            $(".mainTitle").css("display", "none");
            $(".mainTitle2").css("display", "block");
          });
          $("#titleImage").animate({
            height: titleResizedSize + 'px'
          }, animationSpeed, "swing");
        } else {
          $(".mainTitle").css("display", "none");
          $(".mainTitle2").css("display", "block");
        }

        $(".mainSubtitle").css('display', "none");
        $(".scrollBarHelper").children().css("color", "#1c1c1c");

        for (let a = 0; a < 6; a++) {
          if ($(".scrollBar").children()[a] !== elemento) {
            $(".scrollBar").children()[a].style.border = "1px solid #1c1c1c";
          } else {
            $(".scrollBar").children()[a].style.border = "";
          }
        }

        $('.textNosaltres').animate({
          top: 175,
          opacity: 1
        }, 1200, "swing",function(){
          setTimeout(function(){
            $("#tn2").css("visibility","visible");
            $("#tn2").animate({
              opacity:1
            },1200,"swing",function(){
              setTimeout(function(){
                $("#tn3").css("visibility","visible");
                $("#tn3").animate({
                  opacity:1
                },1200,"swing");
              },3000);
            });
          },3000);
        });


        $("html, body").animate({
          scrollTop: ySize
        }, animationSpeed, "swing",function(){
          scrollIsReady = true;
        });
        break;
      case '3':

        topBarActivated();
        $(".scrollBarHelper").children().css("color", "#1c1c1c");

        for (let a = 0; a < 6; a++) {
          if ($(".scrollBar").children()[a] !== elemento) {
            $(".scrollBar").children()[a].style.border = "1px solid #1c1c1c";
          } else {
            $(".scrollBar").children()[a].style.border = "";
          }
        }
          $(".arrow2").css("display","block");

        $("html, body").animate({
          scrollTop: 2 * ySize
        }, animationSpeed, "swing",function(){
          scrollIsReady = true;
        });
        break;
      case '4':
        $(".arrow").css("display","none");
        $(".scrollBarHelper").children().css("color", "#1c1c1c");

        for (let a = 0; a < 6; a++) {

          if ($(".scrollBar").children()[a] !== elemento) {
            $(".scrollBar").children()[a].style.border = "1px solid #1c1c1c";
          } else {
            $(".scrollBar").children()[a].style.border = "";
          }
        }

        topBarActivated();

        $(".imageMissio").animate({
          "left": "51%",
          opacity: 1
        }, 1200, "swing");

        $(".textMissio").animate({
          "right": "51%",
          opacity: 1
        }, 1200, "swing");


        $("html, body").animate({
          scrollTop: 3 * ySize
        }, animationSpeed, "swing",function(){
          scrollIsReady = true;
        });
        break;
      case '5':
        $(".scrollBarHelper").children().css("color", "#e4e4e4");

        for (let a = 0; a < 6; a++) {
          if ($(".scrollBar").children()[a] !== elemento) {
            $(".scrollBar").children()[a].style.border = "1px solid #e4e4e4";
          } else {
            $(".scrollBar").children()[a].style.border = "";
          }
        }


        topBarActivated();


        $("html, body").animate({
          scrollTop: 4 * ySize
        }, animationSpeed, "swing",function(){
          scrollIsReady = true;
        });
        break;
      case '6':
        $(".scrollBarHelper").children().css("color", "#e4e4e4");

        for (let a = 0; a < 6; a++) {
          if ($(".scrollBar").children()[a] !== elemento) {
            $(".scrollBar").children()[a].style.border = "1px solid #e4e4e4";
          } else {
            $(".scrollBar").children()[a].style.border = "";
          }
        }

        topBarActivated();

        $("html, body").animate({
          scrollTop: 5 * ySize
        }, animationSpeed, "swing",function(){
          scrollIsReady = true;
        });
        break;
      default:
        $(".arrow").css("display","block");
        $(".scrollBarHelper").children().css("color", "#e4e4e4");

        for (let a = 0; a < 6; a++) {
          if ($(".scrollBar").children()[a] !== elemento) {
            $(".scrollBar").children()[a].style.border = "1px solid #e4e4e4";
          } else {
            $(".scrollBar").children()[a].style.border = "";
          }
        }

        navbar.classList.remove("sticky");
        $(".mainTitle").css("display", "block");
        $(".mainTitle2").css("display", "none");

        $(".mainTitle").css("font-size", titleSize + "px");
        $("#titleImage").css("height",titleSize +"px");
        $(".mainTitle").css("top", "50%");


        $(".mainSubtitle").css('display', "block");
        //$(".mainTitle").removeClass('animateTopIn');

        $("html, body").animate({
          scrollTop: 0
        }, animationSpeed, "swing",function(){
          scrollIsReady = true;
        });
    }
    lastCase = elemento.id;
    $(".scrollBar").children().removeClass('onZone');
    $(elemento).toggleClass('onZone');
    $(".scrollBarHelper").children().removeClass('onZone1');
    $("#q" + elemento.id).toggleClass('onZone1');
    scrollIsReady = false;
  }
}


var startImages = function() {
  $("#img1").css("margin-left", "-200%");
  $("#img2").css("margin-left", "-100%");
  $("#img3").css("margin-left", "0%");

  $("#img4").css("padding-left", "2%");
  $("#img4").css("padding-right", "2%");

  $("#img5").css("margin-left", "0%");
  $("#img6").css("margin-right", "-100%");

  $("#img7").css("margin-right", "-100%");
  $("#img8").css("margin-right", "-100%");

  $("#img9").css("margin-right", "-100%");
  $("#img10").css("margin-right", "-100%");
}

var scrollOver = function() {
  $(".scrollBarHelper").children().css("visibility", "visible");
}

var scrollNotOver = function() {
  $(".scrollBarHelper").children().css("visibility", "hidden");
}


var nextFoto = function(esquerra) {

  if (ready) {

    ready = false;

    if (esquerra) {
      //left

      for (let i = cIndex + 2; i <= 9; i++) {
        $("#img" + i).hide();
      }

      $("#img" + cIndex).css("padding-left", "0%");
      $("#img" + (cIndex + 1)).css("margin-right", "-100%");
      $("#img" + (cIndex - 2)).css("margin-left", "-35%");

      $("#img" + cIndex).animate({
        "padding-right": "0%"
      }, lateralSpeed, "swing");

      $("#img" + (cIndex - 2)).animate({
        "margin-left": "0%"
      }, lateralSpeed, "swing", function() {
        for (let i = cIndex; i <= 9; i++) {
          $("#img" + i).show();
        }
        ready = true;
      });

      cIndex--;

      $("#img" + cIndex).animate({
        "padding-left": "2%"
      }, lateralSpeed, "swing");

      $("#img" + cIndex).css("padding-right", "2%");

    } else {
      //right

      $("#img" + cIndex).css("padding-right", "0%");

      $("#img" + (cIndex + 1)).show();

      $("#img" + (cIndex + 2)).show();
      $("#img" + cIndex).animate({
        "padding-left": "0%"
      }, lateralSpeed, "swing");

      $("#img" + (cIndex - 1)).animate({
        "margin-left": "-40%"
      }, lateralSpeed, "swing", function() {

        ready = true;
      });

      cIndex++;

      $("#img" + cIndex).animate({
        "padding-right": "2%"
      }, lateralSpeed, "swing");

      $("#img" + (cIndex)).css("margin-right", "0%");
      for (let i = cIndex + 2; i <= 9; i++) {
        $("#img" + (i)).hide();
      }

      $("#img" + cIndex).css("padding-left", "2%");
    }
  }
}

var variaIdioma = function() {
  switch (currentIdioma) {
    case '1':
      //Català

      $('.mainSubtitle').text("Assessorem persones");
      $('#titleNosaltres').text("Nosaltres");
      $('#titleClients').text("Clients");
      $('#titleMissio').text("Missió");
      $('#titleContacte').text("Contacte");
      $('#titleFormulari_').text("Formulari");
      

      $('#formForm').attr('action', "/client/ca/Fitxa_d'alta_treballador.docx");

      $('#q1').text("INICI");
      $('#q2').text("NOSALTRES");
      $('#q3').text("CLIENTS");
      $('#q4').text("MISSIÓ");
      $('#q5').text("FORMULARI");
      $('#q6').text("CONTACTE");

      $('#im1').text("Actors");
      $('#im2').text("Guitarristes");
      $('#im3').text("Productores");
      $('#im4').text("Pianistes");
      $('#im5').text("Disk jockey");
      $('#im6').text("Cantants");
      $('#im7').text("Tècnics de so");
      $('#im8').text("Ballarins");
      $('#im9').text("Models");

      $('#f1').text("Nom");
      $('#f2').text("Cognoms");
      $('#f3').text("Correu electrònic");
      $('#f4').text("Missatge");
      $('#f5').text("Enviar");

      $('#tn1').text("Som una assessoria jurídica i empresarial que fa 25 anys que assessora els seus clients de forma personalitzada i eficaç. La nostra peculiar forma de treballar consisteix a acompanyar-los durant tot el seu projecte de vida laboral amb una implicació rigorosa i individualitzada fent nostres les seves inquietuds.");
      $('#tn2').text("Arrel de l'àmplia demanda de consultes sobre l'optimització i reducció dels costos fiscals i laborals del món escènic ens van motivar a especialitzar-nos en el sector. Així l'any 2012 neix ACTURA 12, una empresa dedicada a solucionar les necessitats dels artistes.");
      $('#tn3').text("Treballem en la gestió i innovació de totes les facetes del món artístic amb l'objectiu d'acompanyar als professionals del sector en el seu treball, simplificant tots els tràmits administratius, fiscals i laborals amb què s'enfronten.");

      $('#tm1').text("Com empresa fem la contractació dels artistes, l'emissió de les factures i la seva liquidació. En definitiva el nostre repte és la simplificació de la gestió optimitzant la retribució.");
      $('#tm2').text("El nostre model de negoci es basa en l'estudi gratuït de la situació fiscal i laboral de l'artista per determinar quina és la millor solució per legalitzar la seva feina, així determinem si és millor que es faci autònom, o pel contrari ho gestionem nosaltres.");
      $('#tm3').text("En aquest segon cas,");
      $('#tm4').text("Com ho fem?");
      $('#tm5').text("La tramitació es fa via e-mail i sense quotes de manteniment ni compromís de permanència.");

      $('#footerL').text("Horari de dilluns a dijous de 9.00 a 14.00 i de 16.00 a 20.00 - Divendres de 9.00 a 14.00");
      $("#descc").text("Descarregar formulari");
      break;
    case '2':
      //English
      $('.mainSubtitle').text("We advise people");
      $('#titleNosaltres').text("About Us");
      $('#titleClients').text("Clients");
      $('#titleMissio').text("Mission");
      $('#titleFormulari_').text("Form");
      $('#titleContacte').text("Contact");
      
      $('#q1').text("WELCOME");
      $('#q2').text("ABOUT US");
      $('#q3').text("CLIENTS");
      $('#q4').text("MISSION");
      $('#q5').text("FORM");
      $('#q6').text("CONTACT");

      $('#formForm').attr('action', '/client/ca/Ficha_alta_trabajador.docx');
      $('#im1').text("Actors");
      $('#im2').text("Guitarists");
      $('#im3').text("Film producers");
      $('#im4').text("Pianists");
      $('#im5').text("Disc jockey");
      $('#im6').text("Singers");
      $('#im7').text("Sound technicians");
      $('#im8').text("Dancers");
      $('#im9').text("Models");

      $('#f1').text("Name");
      $('#f2').text("Surnames");
      $('#f3').text("E-mail");
      $('#f4').text("Message");
      $('#f5').text("Send");

      $('#tn1').text("We are a legal and business consultancy that has been running for 25 years advising their clients in a personalized and effective way. Our distinctive way of working consists in accompany our clients throughout their work life project with a rigorous and individualized involvement making their concerns our own.");
      $('#tn2').text("Due to the demand for consultations about the optimization and reduction in fiscal and labor costs of the scenic world, it motivated us to specialize in this sector. Thus, in 2012, ACTURA 12 was born, a company dedicated to solve the needs of artists.");
      $('#tn3').text("We work in the management and innovation of all facets of the artistic world with the aim of accompanying the professionals of the sector in their work, simplifying all the administrative, fiscal and labor procedures with which they face.");

      $('#tm1').text("As a company, we carry out the hiring of artists, issue the invoices and its subsequent liquidation. Ultimately, our challenge is to simplify management by optimizing the reward.");
      $('#tm2').text("Our business model consists of the FREE study of the fiscal and labor situation of the artist to determine which is the best solution to legalize its work, so we can therefore determine if it is better to become autonomous, or on the contrary, to manage it ourselves.");
      $('#tm3').text("In the latter case,");
      $('#tm4').text("How do we do it?");
      $('#tm5').text("The processing is done via e-mail and without maintenance fees nor commitment to stay.");

      $('#footerL').text("Open from Monday to Thursday from 9.00 to 14.00 and from 16.00 to 20.00 - Friday from 9.00 to 14.00");
      $("#descc").text("Download form");

      break;
    default:
      //Castellano
      $('.mainSubtitle').text("Asesoramos personas");
      $('#titleNosaltres').text("Nosotros");
      $('#titleClients').text("Clientes");
      $('#titleMissio').text("Misión");
      $('#titleFormulari_').text("Formulario");
      
      $('#titleContacte').text("Contacto");

      $('#formForm').attr('action', '/client/ca/Ficha_alta_trabajador.docx');

      $('#q1').text("INICIO");
      $('#q2').text("NOSOTROS");
      $('#q3').text("CLIENTES");
      $('#q4').text("MISIÓN");
      $('#q5').text("FORMULARIO");
      $('#q6').text("CONTACTO");

      $('#im1').text("Actores");
      $('#im2').text("Guitarristas");
      $('#im3').text("Productoras");
      $('#im4').text("Pianistas");
      $('#im5').text("Disc jockey");
      $('#im6').text("Cantantes");
      $('#im7').text("Técnicos de sonido");
      $('#im8').text("Bailarines");
      $('#im9').text("Modelos");

      $('#f1').text("Nombre");
      $('#f2').text("Apellidos");
      $('#f3').text("E-mail");
      $('#f4').text("Mensaje");
      $('#f5').text("Enviar");

      $('#tn1').text("Somos una asesoría jurídica y empresarial que lleva 25 años asesorando a sus clientes de manera personalizada y eficaz. Nuestra peculiar forma de trabajar consiste en acompañarlos durante todo su proyecto de vida laboral con una implicación rigurosa e individualizada haciendo nuestra sus inquietudes.");
      $('#tn2').text("A raíz de la demanda de consultas sobre la optimización y reducción de los costes fiscales y laborales del mundo escénico, nos motivó a especializarnos en este sector. Así en 2012 nace ACTURA 12, una empresa dedicada a solucionar las necesidades de los artistas.");
      $('#tn3').text("Trabajamos en la gestión e innovación de todas las facetas del mundo artístico con el objetivo de acompañar a los profesionales del sector en su trabajo, simplificando todos los trámites administrativos, fiscales y laborales con los que se enfrentan.");

      $('#tm1').text("Como empresa efectuamos la contratación de los artistas, la emisión de las facturas y su posterior liquidación. En definitiva nuestro reto es la simplificación de la gestión optimizando la retribución.");
      $('#tm2').text("Nuestro modelo de negocio consiste en el estudio gratuito de la situación fiscal y laboral del artista para determinar cuál es la mejor solución para legalizar su trabajo, así determinamos si es mejor que se haga autónomo, o por el contrario lo gestionemos nosotros.");
      $('#tm3').text("En este segundo caso,");
      $('#tm4').text("¿Cómo lo hacemos?");
      $('#tm5').text("La tramitación se hace vía e-mail y sin cuotas de mantenimiento ni compromiso de permanencia.");

      $('#footerL').text("Horario de lunes a jueves de 9.00 a 14.00 y de 16.00 a 20.00 - Viernes de 9.00 a 14.00");
      $("#descc").text("Descargar formulario");
  }
}


var submitForm = function(){

  var nom = $('#ff1').val();
  var cog = $('#ff2').val();
  var mail = $('#ff3').val();
  var message = $('#ff4').val();
  var mailOK = mail.indexOf("@") !== -1 && mail.indexOf(".") !== -1 && mail.length >= 5;
  var allGood = mailOK && nom.length !== 0 && cog.length !== 0 && message.length !== 0;

  if(allGood){
    $('#ff1').val("");
    $('#ff2').val("");
    $('#ff3').val("");
    $('#ff4').val("");
    var ip;

    $.getJSON('https://api.ipify.org?format=jsonp&callback=?', function(data) {
      ip = JSON.stringify(data, null, 2);

      socket.emit("MyIpIs",{
        "ip":data.ip,
        "mail":mail,
        "idioma":currentIdioma,
        "nom": nom,
        "cog":cog,
        "message": message
      });
    });


  }else{

    var error;

    if(currentIdioma == 1){
      //Catala
      error = "No s'ha enviat el formulari, els seguents camps no són vàlids:\n";
    }else if(currentIdioma == 2){
      //Ingles
      error = "The form has not beet sent, the following fields are invalid:\n";
    }else{
      //Castella
      error = "No se ha enviado el formulario, los siguientes campos no son válidos:\n";
    }

    if(nom.length === 0){
      if(currentIdioma == 1){
        //Catala
        error += "-> Nom\n";
      }else if(currentIdioma == 2){
        //Ingles
        error += "-> Name\n";
      }else{
        //Castella
        error += "-> Nombre\n";
      }
    }

    if(cog.length === 0){
      if(currentIdioma == 1){
        //Catala
        error += "-> Cognoms\n";
      }else if(currentIdioma == 2){
        //Ingles
        error += "-> Surnames\n";
      }else{
        //Castella
        error += "-> Apellidos\n";
      }
    }

    if(!mailOK){
      if(currentIdioma == 1){
        //Catala
        error += "-> Correu electrònic\n";
      }else if(currentIdioma == 2){
        //Ingles
        error += "-> E-mail\n";
      }else{
        //Castella
        error += "-> E-mail\n";
      }
    }

    if(message.length === 0){
      if(currentIdioma == 1){
        //Catala
        error += "-> Missatge\n";
      }else if(currentIdioma == 2){
        //Ingles
        error += "-> Message\n";
      }else{
        //Castella
        error += "-> Mensaje\n";
      }
    }

    alert(error);
  }
}
