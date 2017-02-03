/*
    ** ncMaps
    ** 
    **
    ** v 1.4.0 26/04/2016
    ** @Nestor Cordova
 */

 /*
    ** R=> REQUERIDO.
    ** O=> OPCIONAL.
    
    **Inicializar
    * new ncMaps(
                {R=> configuracion de script de google},
                {R=> opciones de inicializacion del mapa}
            );
    * new ncMaps(
                {
                    idMapa:     (text),         (R=> string: id del div contenedor del mapa.)
                    loadScript: (boolean),      (O=> Def: TRUE - Se usa para cargar el script de google maps. Default:True)
                    apiKey:     (text),         (R=> El apiKey de google)
                    libraries:  (array)         (O=> Librerias de google, "geometry,places etc..")
                },
                {
                    lat:        (text),         (R=> latitude del centro.)
                    lng:        (text),         (R=> longitude del centro.)
                    LatLng:     (latlng),       (O=> Si se manda, reemplaza a mpOpt.lat y mpOpt.lng.)
                    ui:         (boolean),      (O=> habilitar o no los controles de google.)
                    tipoCtr:    (boolean),      (O=> habilitar o no los controles de google para el tipo de mapa.)
                    streetView: (boolean),      (O=> habilitar o no los controles de street View.)
                    zoom:       (int),          (O=> zoom inicial del mapa.)
                    style:      (arr)           (O=> array de configuracion de estilos del mapa.)
                }
            );
    *
    *
    *
    *
    **
 */
 mcTinItfn=[];
//  if (!window.google) {
//     document.write('<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry"></script>');
// }
function autoncMapsInit(){
  //  mcTinItfn[0].iniciaMapa(mcTinItfn[1]);
}
function ncMaps(mc,optMap){
    if(mc==undefined){return this.error({"error":"{idMapa:'el ID de tu div.'} requerido!","codigo":1})};
    mc.apiKey==undefined       ?    console.log('Advertencia: Ingresa tu apiKey de Google Maps'):this.apiKey=mc.apiKey;
    mc.loadScript==undefined       ?  mc.loadScript=true:"";
    this._idMapa=mc.idMapa;
    this.mapa=null;
    this.markerArray=[];
    this.circuloArray=[];
    this.polyArray=[];
    this.polyGonArray=[];
    this.polylineArray=[];
    this.direcArray=[];
    this.zoom=null;
    this.markerAddress=[];
    this.polylineAnimatedInterval=null;
    if (!window.google&&mc.loadScript==true) {
        console.log('Cool!');
        var libraries="";
        if(mc.libraries!=undefined){
            libraries="libraries=";
            mc.libraries.foreach(function(l,i){
                var c=",";
                if(i==mc.libraries.length-1)
                    c="";
                libraries+=l+c;
            });
         }
        var self=this;
        var apiKey="";
        if (mc.apiKey)
            apiKey='&key='+mc.apiKey;
        this.loadScript('https://maps.googleapis.com/maps/api/js?'+libraries+apiKey,() => this.iniciaMapa(optMap));
        return ;
     }else if(optMap!=undefined)
        () => this.iniciaMapa(optMap);
 }
ncMaps.prototype.getUserPosition        =   function(callback){
    maps=this;
    if (!navigator.geolocation){console.log('Sin soporte GPS.'); return;}
    navigator.geolocation.getCurrentPosition(
        function(position){
            position=maps.generaLatLng(position.coords.latitude,position.coords.longitude);
            maps.userPosition=position;
            callback(position);
        }, 
        function(){
            callback({'Error':'No se pudo localizar.'});
        }
    );
 }
/*
    * Descripción: Inicializa un objeto google.map en el elemento DOM que se indica, se personaliza
    *              el tipo de mapa, el centro del mapa y se habilita o deshabilita la UI de google. 
    -   
    *   Parametros: Recibe un objeto con los siguientes parametros. 
    *   Ejemplo:    {lat:100,lng:200,color:'#FFAAFF',editable:true}
    -
    *      idDiv(string)            -> id del div contenedor del mapa.
    *      mpOpt.lat                -> latitude del centro.
    *      mpOpt.lng                -> longitude del centro.
    *      mpOpt.latLng             -> Si se manda, reemplaza a mpOpt.lat y mpOpt.lng.
    *      mpOpt.ui(boolean)        -> habilitar o no los controles de google.
    *      mpOpt.tipoCtr(boolean)   -> habilitar o no los controles de google para el tipo de mapa.
    *      mpOpt.streetView(boolean)-> habilitar o no los controles de street View.
    *      mpOpt.zoom(int)          -> zoom inicial del mapa.
    *      mpOpt.style(arr)         -> 
    -   
    *   Retorno:
    *       referencia al objeto google.map
 */
ncMaps.prototype.iniciaMapa             =   function (mpOpt) {
    mpOpt==undefined            ? mpOpt={}:"";
    mpOpt.lat==undefined        ? mpOpt.lat=19.2469:"";
    mpOpt.lng==undefined        ? mpOpt.lng=-103.7263:"";
    mpOpt.zoom==undefined       ? mpOpt.zoom=10:"";
    mpOpt.zoomCtr==undefined    ? mpOpt.zoomCtr=true:""; 
    mpOpt.ui==undefined         ? mpOpt.ui=true:"";
    mpOpt.tipoCtr==undefined    ? mpOpt.tipoCtr=true:"";
    mpOpt.streetView==undefined ? mpOpt.streetView=true:"";
    mpOpt.latLng==undefined     ? mpOpt.latLng=new google.maps.LatLng(mpOpt.lat, mpOpt.lng):"";
    mpOpt.style==undefined      ? mpOpt.style=[{"featureType": "poi", "stylers": [{ "visibility": "off" }]}]:"";
    this.originalPosition=mpOpt.latLng;
    this.originalZoom=mpOpt.zoom;
    var mapOptions = {
        zoom:parseInt(mpOpt.zoom),
        disableDefaultUI: mpOpt.ui,
        mapTypeControl:  mpOpt.tipoCtr,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM   
        },
        streetViewControl: mpOpt.streetView,
        zoomControl: mpOpt.zoomCtr,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.large,
            position: google.maps.ControlPosition.RIGHT_CENTER  
        },
         center:mpOpt.latLng,
         styles: mpOpt.style
     };

     // mapa.mapa.setOptions({zoomControlOptions:{position: google.maps.ControlPosition.LEFT_CENTER},
        // streetViewControlOptions:{position: google.maps.ControlPosition.LEFT_CENTER}})
    this.mapa=new google.maps.Map(document.getElementById(this._idMapa),mapOptions);
 };
/*
 *    -----------------
 *   - iniciaSearchBox -
 *    -----------------
 *   Inicializa la funcion de busqueda de lugares, crea la caja de textos necesaria.
 *   
 *   Parametros:
 *   placeholder(Opcional)-> Indica el texto que debe aparecer en la caja.
 */
ncMaps.prototype.iniciaSearchBox        =   function(objSearch){
    objSearch==undefined                        ?   objSearch={}:"";
    objSearch.text==undefined                   ?   objSearch.text="¿Qué es lo que buscas?":"";
    objSearch.change==undefined                 ?   objSearch.change=false:"";
    objSearch.autoReturnToPosition==undefined   ?   objSearch.autoReturnToPosition=false:"";

    var self=this;
    var input =$('<input type="text" id="search" class="form-control" placeholder="'+objSearch.text+'" style="padding:10px;background-color:rgba(255,255,255,0.93);margin:10px 0 0 10px;width:35%;max-width:500px;border: 1px solid #BFBFBF;">')[0];
    cl=$('<i id="clSrc" class="glyphicon glyphicon-remove" style="display:none;margin:10px 0 0 -20px;line-height:30px;color:gray;cursor:pointer;font-size:15px;width:20px;background-color: white;"></i>')[0];
    try{
        new google.maps.places.SearchBox(($("<input>")[0]));
    }catch(err){
        console.log("Error: Se requiere la libreria 'Places' de google maps para searchBox.");
       // console.log(err);
        return ;
    }
    /*Genera los elementos html en el mapa*/
    this.mapa.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    this.mapa.controls[google.maps.ControlPosition.TOP_LEFT].push(cl);
   
    /*Inicializa las funciones jquery para la busqueda, retraso 2s*/
    ax=setInterval(function(){
        clearInterval(ax);
        $("#clSrc").click(function(){
            $("#clSrc").fadeOut(500);
            $("#search").val("");
        if(objSearch.autoReturnToPosition){
            self.mapa.panTo(self.originalPosition);
            self.mapa.setZoom(self.originalZoom);
        }
            try{searchBoxMarker.setMap(null);}catch(err){}
        });
        $("#clSrc").hover(function(){
            $(this).css("color", "red");
        }, function(){
            $(this).css("color", "gray");
        });
        $("#search").bind("input",function(){
            if($(this).val()==""){
                $("#clSrc").fadeOut(500);
                try{searchBoxMarker.setMap(null);}catch(err){}
            }
        });
    },2000);
    this.searchBox = new google.maps.places.SearchBox(input);
    self.searchBox.setBounds(self.mapa.getBounds());
    this.mapa.addListener('bounds_changed', function() {
        self.searchBox.setBounds(self.mapa.getBounds());
    });
    this.searchBox.addListener('places_changed', function() {
        var places = self.searchBox.getPlaces();
        if (places.length == 0) {
            return;
        }
        try{searchBoxMarker.setMap(null);}catch(err){}
            $("#clSrc").fadeIn(500);
            place=places[0];
        if(objSearch.change!=false){//si hay funcion change, la ejecuta 
            place.position=place.geometry.location;
            objSearch.change(place);
            return ;
        }
        p=place.geometry.location;
        searchBoxMarker=self.agregarMarcador({lat:p.lat(),lng:p.lng(),titulo:place.name,mover:true});
    });
 }
/*
    *   Descripción: Esta función pinta sobre un google map un círculo.
    -   
    *   Parametros: Recibe un objeto con los siguientes parametros. 
    *   Ejemplo:    {lat:100,lng:200,color:'#FFAAFF',editable:true}
    -
    *       circOpt.lat             -> Latitud del centro del circulo.
    *       circOpt.lng             -> Longitud del centro del circulo.
    *       circOpt.latLng          -> Puede recibir un objeto latLng en lugar de la latitud y longitud.
    *       circOpt.color           -> Define el color Hex para el circulo.
    *       circOpt.opacidadColor   -> Define la opacidad del color del circulo, de 0 a 1.
    *       circOpt.colorBorde      -> Define el color Hex para el borde del circulo.
    *       circOpt.opacidadBorde   -> Define la opacidad del color del borde del circulo, de 0 a 1.
    *       circOpt.anchoBorde      -> Define el grosor del borde en Pixeles.
    *       circOpt.editable        -> (boolean) Especifica si el circulo sera editable.
    *       circOpt.clickable       -> (boolean) Especifica si se le podra hacer click al circulo.
    *       circOpt.arrastrable     -> (boolean) Especifica si se podra arrastrar el circulo.
    *       circOpt.radio           -> (numeric) Define el radio del circulo en Metros.
    *       circOpt.mover           -> (boolean) Especifica si el mapa se debe reajustar al tamaño del circulo.
    *   
    *   Retorno:
    *       referencia al objeto google.maps.Circle
    */
ncMaps.prototype.agregarCirculo         =   function(circOpt){
   if(circOpt==undefined){return this.error({"error":"circOpt","codigo":1})};
    circOpt.lat==undefined          ? circOpt.lat=19.2469:"";
    circOpt.lng==undefined          ? circOpt.lng=-103.7263:"";
    circOpt.latLng==undefined       ? circOpt.latLng=new google.maps.LatLng(circOpt.lat, circOpt.lng):"";
    circOpt.color==undefined        ? circOpt.color="#66CCFF":"";
    circOpt.opacidadColor==undefined? circOpt.opacidadColor=0.5:"";
    circOpt.colorBorde==undefined   ? circOpt.colorBorde="#66F":"";
    circOpt.opacidadBorde==undefined? circOpt.opacidadBorde=0.8:"";
    circOpt.anchoBorde==undefined   ? circOpt.anchoBorde=2:"";
    circOpt.editable==undefined     ? circOpt.editable=false:"";
    circOpt.clickable==undefined    ? circOpt.clickable=false:"";
    circOpt.arrastrable==undefined  ? circOpt.arrastrable=false:"";
    circOpt.radio==undefined        ? circOpt.radio=1000:circOpt.radio=circOpt.radio; 
    circOpt.mover==undefined        ? circOpt.mover=false:"";
    circOpt.mapa=circOpt.mapa=this.mapa;
    var circulo = new google.maps.Circle({
        center        : circOpt.latLng,
        radius        : circOpt.radio,
        strokeColor   : circOpt.colorBorde,
        strokeOpacity : circOpt.opacidadBorde,
        editable      : circOpt.editable,
        clickable     : circOpt.clickable,
        strokeWeight  : circOpt.anchoBorde,
        fillColor     : circOpt.color,
        draggable     : circOpt.arrastrable,
        fillOpacity   : circOpt.opacidadColor,
        map           : circOpt.mapa
    });
    if(circOpt.mover)
        this.moverMapa({latLng:circulo.getCenter()});
    this.circuloArray.push(circulo);
    return circulo;
 }
/*
    *   Descripción:Genera un infoWindow para un marcador especifico.
    -   
    *   Parametros: Recibe un objeto con los siguientes parametros. 
    *   Ejemplo:    {contenido:[{"Fila1":"Dato1"},{"Fila2":"Dato2"}],autoPan:true}
    -
    *   mpOpt.marker        -> Marcador al que se le agregara el info... 
    *   mpOpt.contenido     -> El contenido debe ser un array para generar una tabla
                               de DOS columnas.[{"Fila1":"Dato1"},{"Fila2":"Dato2"}]
    *   mpOpt.autoPan       -> Mueve o no el mapa al generar el info..   

 */
ncMaps.prototype.agregarInfoWindow      =   function(infData){
    if(infData.marker==undefined){  return this.error({"error":"infData","codigo":1})};
    infData.contenido==undefined    ? infData.contenido=infData.marker.getTitle():"";
    infData.autoPan==undefined      ? infData.autoPan=false:"";
        var info = new google.maps.InfoWindow({
            disableAutoPan: infData.autoPan
        });
        google.maps.event.addListener(infData.marker,"click", function() { 
            info.setContent(infData.contenido);
            info.open(infData.marker.getMap(),infData.marker); 
        });
        return info;  
 }
/*
    *    ----------------
    *   - agregaMarcador -
    *    ----------------
    *   Agrega marcador al mapa con parametros que se espesifican mediante un objeto.
    *
    *   Parametros: Recibe un objeto con los siguientes parametros. 
    *   Ejemplo:    {lat:100,lng:200,color:'#FFAAFF',editable:true}
    *
    *   mpOpt.lat           -> latitude del centro.
    *   mpOpt.lng           -> longitude del centro.
    *   mpOpt.latLng        -> Si se manda, reemplaza a mpOpt.lat y mpOpt.lng.
    *   mpOpt.arrastrable   -> Define si se podra arrastrar o no.
    *   mpOpt.urlIcon       -> Define la url de algun icono externo.
    *   mpOpt.titulo        -> Titulo para el marcador.
 */
ncMaps.prototype.agregarMarcador        =   function (markOpt){
    if(markOpt==undefined){         return this.error({"error":"markOpt","codigo":1})};
    markOpt.lat==undefined          ? markOpt.lan=19.2469:"";
    markOpt.lng==undefined          ? markOpt.lng=-103.7263:"";
    markOpt.latLng==undefined       ? markOpt.latLng=new google.maps.LatLng(markOpt.lat, markOpt.lng):"";
    markOpt.arrastrable==undefined  ? markOpt.arrastrable=false:"";
    markOpt.urlIcon==undefined     ? markOpt.urlIcon="":""; 
    markOpt.titulo==undefined       ? markOpt.titulo="Marcador":"";
    markOpt.mapa===undefined         ? markOpt.mapa=this.mapa:"";
    markOpt.mover==undefined        ? markOpt.mover=false:"";
    markOpt.infoWindow==undefined   ? markOpt.infoWindow=false:"";   
    markOpt.clickable==undefined   ? markOpt.clickable=true:"";   
    markOpt.contenidoInfo==undefined? markOpt.contenidoInfo=markOpt.titulo:"";
    markOpt.zIndex==undefined? markOpt.zIndex=1:"";
    var opcionesMarca = {
        position: markOpt.latLng,
        icon: markOpt.urlIcon,  
        title: markOpt.titulo, 
        draggable: markOpt.arrastrable,
        map:markOpt.mapa,
        clickable: markOpt.clickable,
        zIndex:markOpt.zIndex
    
    };
     var marker = new google.maps.Marker(opcionesMarca);
    if(markOpt.mover)
        this.moverMapa({latLng:marker.getPosition()});
    this.markerArray.push(marker);
    if(markOpt.infoWindow)
        marker.infoWindow=this.agregarInfoWindow({marker:marker,contenido:markOpt.contenidoInfo});

    return marker;
 };
/*
    *    ----------------
    *   - agregaPolyline -
    *    ----------------
    *   Agrega una Polyline al mapa con parametros que se espesifican mediante un objeto.
    *
    *   Parametros: Recibe un objeto con los siguientes parametros. 
    *   Ejemplo:    {lat:100,lng:200,color:'#FFAAFF',editable:true}
    *
    *   mpOpt.puntos            -> Los puntos que conforman la Polyline.
    *   mpOpt.flechas           -> Muestra flechas direccionales en la Polyline
    *   mpOpt.colorLinea        -> ...
    *   mpOpt.opacidadLinea     -> ...  
    *   mpOpt.anchoLinea        -> ...
    *   mpOpt.opacidadLinea     -> ...
 */
ncMaps.prototype.agregaPolyline         =    function(polyOpt){
    var self=this;
    if(polyOpt==undefined)              { return this.error({"error":"polyOpt","codigo":1})};
    if(polyOpt.path==undefined)       { return this.error({"error":"polyOpt","codigo":2})};
    polyOpt.flechas==undefined          ? polyOpt.flechas=false:"";
    polyOpt.colorLinea==undefined       ? polyOpt.colorLinea="#336666":"";
    polyOpt.opacidadLinea==undefined    ? polyOpt.opacidadLinea=1:"";
    polyOpt.anchoLinea==undefined       ? polyOpt.anchoLinea=2:"";
    polyOpt.mapa==undefined             ? polyOpt.mapa=this.mapa:"";
    polyOpt.banderas==undefined         ? polyOpt.banderas=false:""; 
    polyOpt.animado==undefined         ? polyOpt.animado=false:""; 
    polyOpt.intervalo==undefined         ? polyOpt.intervalo=100:""; 
    if(polyOpt.banderas){
        this.agregarMarcador({titulo:"Origen",latLng:polyOpt.path[0],urlIcon:'http://maps.google.com/mapfiles/ms/micons/blue.png'})
        this.agregarMarcador({titulo:"Destino",latLng:polyOpt.path[polyOpt.path.length-1],urlIcon:'http://maps.google.com/mapfiles/ms/micons/red-dot.png'})
     }
    var simbolo_flecha="";
    if(polyOpt.flechas){
        simbolo_flecha = {
            path:google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            strokeOpacity:  1,
            strokeWeight:   1,
            //editable: true,
            scale:2,
            fillColor:polyOpt.colorLinea,
            fillOpacity:1
        }; 
     }     
    if(polyOpt.animado){
        try{
            clearInterval(self.polylineAnimatedInterval);
        }catch(err){}
        var polyline = new google.maps.Polyline({
            path:[polyOpt.path[0]],
            map: self.mapa,
            strokeColor:polyOpt.colorLinea, 
            strokeOpacity: polyOpt.opacidadLinea,
            strokeWeight: polyOpt.anchoLinea,
            scale: 2,
            clickable: false,
            fillOpacity:polyOpt.opacidadLinea,
            icons: [{
                icon: simbolo_flecha,
                offset: '0',
                repeat: '200px'
            }]
        }); 
        path=polyline.getPath();
        var count = 1;
        self.polylineAnimatedInterval=setInterval(function() {
            path.push(polyOpt.path[count]);
            if(count==polyOpt.path.length-1)
                clearInterval(self.polylineAnimatedInterval);
            count++;
      }, polyOpt.intervalo);
    }else
    var polyline = new google.maps.Polyline({
        path:polyOpt.path,
        map: self.mapa,
        strokeColor:polyOpt.colorLinea, 
        strokeOpacity: polyOpt.opacidadLinea,
        strokeWeight: polyOpt.anchoLinea,
        scale: 2,
        clickable: false,
        fillOpacity:polyOpt.opacidadLinea,
        icons: [{
            icon: simbolo_flecha,
            offset: '0',
            repeat: '200px'
        }]
    }); 

    this.polylineArray.push(polyline);
    //obj.polyArray.push(polyline);
    return polyline;
 }
/*
    *    ----------------
    *   - agregaPolygon -
    *    ----------------
    *   Agrega una Polyline al mapa con parametros que se espesifican mediante un objeto.
    *
    *   Parametros: Recibe un objeto con los siguientes parametros. 
    *   Ejemplo:    {lat:100,lng:200,color:'#FFAAFF',editable:true}
    *
    *   mpOpt.puntos            -> Los puntos que conforman la Polyline.
    *   mpOpt.flechas           -> Muestra flechas direccionales en la Polyline
    *   mpOpt.colorLinea        -> ...
    *   mpOpt.opacidadLinea     -> ...  
    *   mpOpt.anchoLinea        -> ...
    *   mpOpt.opacidadLinea     -> ...
 */
ncMaps.prototype.agregaPolygon          =    function(polyOpt){
    if(polyOpt==undefined)              { return this.error({"error":"polyOpt","codigo":1})};
    if(polyOpt.puntos==undefined)       { return this.error({"error":"polyOpt","codigo":2})};
    polyOpt.mapa===undefined             ? polyOpt.mapa=this.mapa:"";
    polyOpt.color==undefined            ? polyOpt.color="#00B8D4":"";
    polyOpt.colorLinea==undefined       ? polyOpt.colorLinea="#ffffff":"";
    polyOpt.opacidadLinea==undefined    ? polyOpt.opacidadLinea=1:"";
    polyOpt.anchoLinea==undefined       ? polyOpt.anchoLinea=1:"";
    polyOpt.opacidadRelleno==undefined  ? polyOpt.opacidadRelleno=1:"";
    polyOpt.infoBoxContent==undefined   ? polyOpt.infoBoxContent="---":"";
    polyOpt.infoBoxEnable==undefined    ? polyOpt.infoBoxEnable=false:"";
    var polygon = new google.maps.Polygon({
        paths:polyOpt.puntos,
        map: polyOpt.mapa,
        strokeColor:polyOpt.colorLinea, 
        fillColor:polyOpt.color, 
        strokeOpacity: polyOpt.opacidadLinea,
        fillOpacity: polyOpt.opacidadRelleno,
        strokeWeight: polyOpt.anchoLinea,
        clickable: true,
        infoBoxEnable: polyOpt.infoBoxEnable,
        infoBoxContent: polyOpt.infoBoxContent
    }); 



    polygon.getBounds = function(){
        var bounds = new google.maps.LatLngBounds()
        this.getPath().forEach(function(element,index){bounds.extend(element)})
        return bounds
    }

    polygon.getCenter = function(){return this.getBounds().getCenter()}


    if(this.infoBoxEnable){
        console.log(this.infoBoxEnable);
        var labelOptions = {
            content: this.infoBoxContent,
            boxStyle: {
              textAlign: "center",
              fontSize: "8pt",
              width: "50px"
            },
            disableAutoPan: true,
            pixelOffset: new google.maps.Size(-25, 0),
            position: this.getBounds().getCenter(),
            closeBoxURL: "",
            isHidden: false,
            pane: "mapPane",
            enableEventPropagation: true
        };
        polygon.infoBox = new InfoBox(labelOptions);
        polygon.infoBox.open(polygon.getMap());
    }
 
  //    this.polyGonArray.push(polygon);
    return polygon;
 }
/*
    *    ----------------
    *   - getDirecciones -
    *    ----------------
    *   Obtiene la direccion de un punto a otro y la muestra en el mapa con parametros que se espesifican mediante un objeto.
    *
    *   Parametros: Recibe un objeto con los siguientes parametros. 
    *   Ejemplo:    {origen:'Colima Col.',destino:'Manzanillo Col.'}
    *
    *   mpOpt.origen            -> latitude o nombre del lugar de origen.
    *   mpOpt.destino           -> longitude o nombre del lugar de destino.
    *   mpOpt.puntosObligados   -> Puntos por los que debe pasar la ruta de forma obligada.
    *   mpOpt.travelMode        -> Tipo de recorrido, Auto, bici, a pie.
    *   mpOpt.verDistancia      -> Mostrar la distancia total del recorrido.
    *   mpOpt.preserveViewport  -> Conservar la vista del mapa actual.
    *   mpOpt.draggable         -> Permite mover los puntos de la ruta.
 */
ncMaps.prototype.getDirecciones         =    function(directOpt,callback){
    var _obj=this;
    var callbackData={};
    $.each(_obj.direcArray,function(i,obj){obj.setMap(null);});$("#mAkmToNsUn").remove();
    var _travelMode;
    var _waypoints=[];
    if(directOpt==undefined)                { return this.error({"error":"directOpt","codigo":1})};
    if(directOpt.origen==undefined)         { return this.error({"error":"directOpt","codigo":2})};
    if(directOpt.destino==undefined)        { return this.error({"error":"directOpt","codigo":3})};
    directOpt.puntosObligados==undefined    ? directOpt.puntosObligados=[]:"";
    directOpt.travelMode==undefined         ? directOpt.travelMode="DRIVING":"";
    directOpt.verDistancia==undefined       ? directOpt.verDistancia=false:"";
    directOpt.preserveViewport==undefined   ?  directOpt.preserveViewport=true:"";
    directOpt.suppressMarkers==undefined   ?  directOpt.suppressMarkers=false:"";
    directOpt.suppressPolylines==undefined   ?  directOpt.suppressPolylines=false:"";
    directOpt.mapa===undefined               ?  directOpt.mapa=_obj.mapa:"";
    directOpt.draggable==undefined          ?  directOpt.draggable=false:"";
    callback==undefined                     ?  callback=null:"";

    switch(directOpt.travelMode.toUpperCase()){
            case "BICYCLING":
                _travelMode=google.maps.TravelMode.BICYCLING;
            break;
            case "TRANSIT":
                _travelMode=google.maps.TravelMode.TRANSIT;
            break;
            case "WALKING":
                _travelMode=google.maps.TravelMode.WALKING;
            break;
            default:
                _travelMode=google.maps.TravelMode.DRIVING;
            break;
     }
    $.each(directOpt.puntosObligados,function(i,po){
        _waypoints.push({location:po});
     });
    var totalKm=function(result){
        var total = 0;
        var myroute = result.routes[0];
        for (var i = 0; i < myroute.legs.length; i++) {
            total += myroute.legs[i].distance.value;
        }
        total = total / 1000;
        return total + ' km';
     }
    var directionsDisplay=new google.maps.DirectionsRenderer({
        map         : directOpt.mapa,
        draggable   : directOpt.draggable
     });
    if(directOpt.verDistancia){//Muestra la distancia en Km.
        google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {
            var tKm=totalKm(directionsDisplay.getDirections());
            if($("#mAkmToNsUn")[0]==undefined)
                $("#"+_obj._idMapa).append("<div id='mAkmToNsUn'>Distancia: "+tKm+"</div>");
            else
                $("#mAkmToNsUn").html("Distancia: "+tKm);
            
            if($("#styleMn3X")[0]==undefined)
                $("head").append("<style id='styleMn3X'>#mAkmToNsUn{position:absolute;background-color:#3367D6;color:white;padding:10px;margin:10px;border-radius:3px;bottom:0px;-webkit-transition: background-color 2s ease-out;-moz-transition: background-color 10s ease-out;-o-transition: background-color 10s ease-out;transition: background-color 10s ease-out;}#mAkmToNsUn:hover{background-color: red;cursor:pointer}</style>")
            

            // $("#mAkmToNsUn").click(function(){
            //      $.each(_obj.direcArray,function(i,obj){obj.setMap(null);});$("#mAkmToNsUn").fadeOut(500).remove();
            // });
        });
     }
    var directionsService = new google.maps.DirectionsService();
    var start = directOpt.origen;
    var end = directOpt.destino;

    var request = {
        origin:start,
        destination:end,
        waypoints:_waypoints,
        travelMode: _travelMode,
        durationInTraffic: true,
        unitSystem: google.maps.UnitSystem.METRIC
     };

    directionsService.route(request, function(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setOptions({ preserveViewport: directOpt.preserveViewport,suppressMarkers: directOpt.suppressMarkers,suppressPolylines:directOpt.suppressPolylines});
            directionsDisplay.setDirections(result);
            _obj.direcArray.push(directionsDisplay);
            callbackData.obj=directionsDisplay;
            callbackData.duracion=directionsDisplay.directions.routes[0].legs[0].duration.text;
            callbackData.distancia=directionsDisplay.directions.routes[0].legs[0].distance.text.replace(",",".");
            if(callback!=null)
                callback(callbackData);
            
        }
    });
 }
/*
    *    ----------------
    *   - getDistancia -
    *    ----------------
    *   Obtiene la distancia de un marcador a otro.
    *
    *   Parametros: Recibe un objeto con los siguientes parametros. 
    *   Ejemplo:    {muestra:'m'}
    *
    *   mpOpt.from      -> (marker), marcador inicial
    *   mpOpt.to        -> (marker), marcador destino.
    *   mpOpt.muestra   -> Medida en la que se mostrara la distancia (cm,m,km)
    *
 */
ncMaps.prototype.getDistancia           =   function(disOpt){
    if(disOpt==undefined){return this.error({"error":"disOpt","codigo":1})};
    if(disOpt.from==undefined){return this.error({"error":"disOpt","codigo":2})};
    if(disOpt.to==undefined){return this.error({"error":"disOpt","codigo":3})};
    disOpt.muestra==undefined?disOpt.muestra="m":""; 
    try{
        var dis=google.maps.geometry.spherical.computeDistanceBetween(disOpt.from, disOpt.to);
    }catch(er){console.log('Deben ser puntos LatLng');}
    var u="";
    switch(disOpt.muestra){
            case "cm":
                dis=(dis*100).toFixed(2)
                u={l:"Centimetros",c:"cm"};
            break;
            case "m":
                dis=dis.toFixed(2)
                u={l:"Metros",c:"m"};
            break;
            case "km":
                dis=(dis/100).toFixed(2)
                u={l:"Kilometros",c:"km"};
            break;
    } 
    result={distancia:dis,unidadC:u.c,unidadL:u.l};
    return result;
 }    
ncMaps.prototype.getDistanciaLineal     =   function(disLinOpt){
        var rad = function(x) {
            return x * Math.PI / 180;
        };
        if(disLinOpt==undefined){return this.error({"error":"disLinOpt","codigo":1})};
        if(disLinOpt.from==undefined){return this.error({"error":"disLinOpt","codigo":2})};
        if(disLinOpt.to==undefined){return this.error({"error":"disLinOpt","codigo":3})};
        
        var R = 6378137; // Earth’s mean radius in meter
        var dLat = rad(disLinOpt.to.lat() - disLinOpt.from.lat());
        var dLong = rad(disLinOpt.to.lng() - disLinOpt.from.lng());
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(disLinOpt.from.lat())) * Math.cos(rad(disLinOpt.to.lat())) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d; // returns the distance in meter
    }
/*
 *
 */
ncMaps.prototype.getRumboText           =   function(ru){
    switch (ru){
        case 0:
            return "NORTE";
        break;
        case 1:
            return "NORESTE";
        break;
        case 2:
            return "ESTE";
        break;
        case 3:
            return "SURESTE";
        break;
        case 4:
            return "SUR";
        break;
        case 5:
            return "SUROESTE";
        break;
        case 6:
            return "OESTE";
        break;
        case 7:
            return "NOROESTE";
        break;
    } 
 }
/*
 *
 */

ncMaps.prototype.latLngBounds           =   function(ne,sw){
    return new google.maps.LatLngBounds(ne,sw);
};
ncMaps.prototype.latLng                 =   function(lat,lng){
    var latLng=new google.maps.LatLng(parseFloat(lat),parseFloat(lng));
    return latLng;
 }
 /*
 *
 */
ncMaps.prototype.generaKMLtext          =   function(generaKML){
    if(generaKML==undefined){return this.error({"error":"generaKML","codigo":1})};
    if(generaKML.puntos==undefined){return this.error({"error":"generaKML","codigo":2})};
    generaKML.titulo==undefined?generaKML.titulo="Ruta":""; 
    var _coordinates="";
    $.each(generaKML.puntos,function(i,p){
        _coordinates+=p.F+','+p.A+','+'0 ';
     });
    var _xml='<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom"><Document><name>'+generaKML.titulo+'.kml</name><StyleMap id="msn_ylw-pushpin"><Pair><key>normal</key><styleUrl>#sn_ylw-pushpin</styleUrl></Pair><Pair><key>highlight</key><styleUrl>#sh_ylw-pushpin</styleUrl></Pair></StyleMap><Style id="sh_ylw-pushpin"><IconStyle><scale>1.3</scale><Icon><href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href></Icon><hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/></IconStyle><LineStyle><color>ccff6a00</color><width>4</width></LineStyle></Style><Style id="sn_ylw-pushpin"><IconStyle><scale>1.1</scale><Icon><href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href></Icon><hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/></IconStyle><LineStyle><color>ccff6a00</color><width>4</width></LineStyle></Style><Placemark><name>'+generaKML.titulo+'</name><styleUrl>#msn_ylw-pushpin</styleUrl><LineString><tessellate>1</tessellate><coordinates>'+_coordinates+'</coordinates></LineString></Placemark></Document></kml>';
    return _xml;
 }
/*
 * Ajusta el zoom del mapa para mostrar todos los marcadores.
 */
ncMaps.prototype.autoZoom               =   function(objAz){
    if(objAz==undefined){return this.error({"error":"objAz","codigo":1})};
    if(objAz.path==undefined){return this.error({"error":"objAz - Se requiere un path","codigo":2})};
    if(objAz.tipo==undefined){return this.error({"error":"objAz - Se require un tipo de objeto",codigo:3})};
    objAz.qZoom==undefined      ?       objAz.qZoom=0:""; 
    var latlngbounds = new google.maps.LatLngBounds();
    $.each(objAz.path,function(i,o){
        switch (objAz.tipo.toLocaleLowerCase()){
            case "latlng":
                latlngbounds.extend(o);
            break;
            case "marker":
                latlngbounds.extend(o.getPosition());
            break;
            case "polygon":
                latlngbounds.extend(o.getCenter());
            break;

        }
    });
    this.mapa.fitBounds(latlngbounds);
    this.mapa.setZoom((this.mapa.getZoom() - objAz.qZoom));
 }
/*
 *
 *   
 */
ncMaps.prototype.moverMapa              =   function(moverOpt){
    if(moverOpt==undefined){return this.error({"error":"moverOpt","codigo":1})};
    moverOpt.lat==undefined     ? moverOpt.lat=19.2469:"";
    moverOpt.lng==undefined     ? moverOpt.lng=-103.7263:"";
    moverOpt.latLng==undefined  ? moverOpt.latLng=new google.maps.LatLng(moverOpt.lat, moverOpt.lng):"";
    this.mapa.panTo(moverOpt.latLng);
 }
/*
 *
 *   
 */
ncMaps.prototype.getEsquinas            =   function(){
        var bounds=this.mapa.getBounds();
        var NorthEast = bounds.getNorthEast();
        var SouthWest = bounds.getSouthWest();
        var NE=new google.maps.LatLng(NorthEast.lat(), NorthEast.lng());
        var SE=new google.maps.LatLng(SouthWest.lat(), NorthEast.lng());
        var SO=new google.maps.LatLng(SouthWest.lat(),SouthWest.lng());
        var NO=new google.maps.LatLng(NorthEast.lat(),SouthWest.lng());
        this.zoom=this.mapa.getZoom();
        var puntos= {"zoom":this.zoom,'NE':NE,'SE':SE,"SO":SO,"NO":NO};
        return puntos;
 }
/*
 *
 *   
 */
ncMaps.prototype.pointToTrazo           =   function(point){
    if(point==null)
        return "Se requiere array de coordenadas:[{long,lat}]";
    var points=point.replace(/["'()]/g,"").replace(/POINT /g,"").split(",");
    var path= new Array();
    $.each(points,function (c,p){
         p=p.split(" ");
        lt=new google.maps.LatLng(p[1],p[0]);
        path.push(lt);
    });
    var trazoCodificado = google.maps.geometry.encoding.encodePath(path);
    return trazoCodificado;
 }
ncMaps.prototype.polygonToTrazo         =   function(POLYGON){
    if(POLYGON==null)
        return "Se requiere array de coordenadas:[{long,lat},{long,lat}]";
    var points=POLYGON.replace(/["'()]/g,"").replace(/POLYGON/g,"").split(",");

    var path= new Array();
    $.each(points,function (c,p){
        p=p.split(" ");
        lt=new google.maps.LatLng(p[1],p[0]);
        path.push(lt);
    });
    var trazoCodificado = google.maps.geometry.encoding.encodePath(path);
    return trazoCodificado;
 }
/*
 *
 */
ncMaps.prototype.trazoToPath            =   function(trazo){
    return google.maps.geometry.encoding.decodePath(trazo);
 }
ncMaps.prototype.renew                  =   function(){
    google.maps.event.trigger(this.mapa, "resize");
 }
/*
 *
 */
ncMaps.prototype.getZoom                =   function(){
    return this.mapa.getZoom();
 }
ncMaps.prototype.getAddressByPosition   =   function(latLng,callback){
    if(latLng==undefined){return this.error({"error":"locationOpt","codigo":1})};
    if(this.geocoder==undefined)this.geocoder = new google.maps.Geocoder();
   var self=this;
    this.geocoder.geocode(
        {'location':latLng
        },function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var dir=results[0].formatted_address;
                callback({'direccion':dir});
            } else {
                window.alert('Google no pudo encontrar a la dirección: ' + status);
            }
        });
 }
ncMaps.prototype.getPositionByAddress   =   function(addressOpt,callback){
    if(addressOpt==undefined){return this.error({"error":"addressOpt","codigo":1})};
    if(this.geocoder==undefined)            this.geocoder = new google.maps.Geocoder();
    addressOpt.country==undefined       ?   addressOpt.country="MX":"";
    addressOpt.postalCode==undefined    ?   addressOpt.postalCode="28000":"";
    addressOpt.address==undefined       ?   addressOpt.address="":"";
    addressOpt.restrictions==undefined  ?   addressOpt.restrictions=false:"";
    addressOpt.restrictions==false      ?   addressOpt.restrictions={}:addressOpt.restrictions={country: addressOpt.country,postalCode: addressOpt.postalCode};
    var self=this;
    //19.840937, -104.460513
    //18.515363, -103.672244

    var request={};
    if(addressOpt.address)
        request.address=addressOpt.address;
    if(addressOpt.location)
        request.location=addressOpt.location;
    if(addressOpt.latLngBounds){
        var v=addressOpt.latLngBounds;
        bounds=new google.maps.LatLngBounds();
        bounds.extend(v.a);
        bounds.extend(v.b);
        request.bounds=bounds;
    }
    console.log(request);
    this.geocoder.geocode(
        request,
        function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                console.log(results);
                var position=results[0].geometry.location;
                var dir=results[0].formatted_address;
                callback({'position':position,'direccion':dir});    
            } else {
                if(addressOpt.restrictions.country!=undefined){
                    console.log('otra oportunidad');
                    self.getPositionByAddress({restrictions:false,address: addressOpt.address,content:addressOpt.content});
                }else
                    window.alert('Google no pudo encontrar a la persona: ' + status);
            }
        });
 }
ncMaps.prototype.snapedRoad          =   function(spRopt,callback){
    if(spRopt==undefined){return this.error({"error":"Se requiere objeto","codigo":1})};
    if(spRopt.path==undefined){return this.error({"error":"path requerido","codigo":2})};
    spRopt.interpolate==undefined       ?   spRopt.interpolate=true:"";
    pathValues = [];
    $.each(spRopt.path,function(i,d){
        pathValues.push(d.toUrlValue());
     });
    var self=this;
    $.get('https://roads.googleapis.com/v1/snapToRoads', {
        interpolate: spRopt.interpolate,
        key: self.apiKey,
        path: pathValues.join('|')
      }, function(data) {
        var puntos=[];
        $.each(data.snappedPoints,function(i,d){
           var latlng=self.latLng(d.location.latitude,d.location.longitude);
           puntos.push(latlng);
         });
        //snappedPolyline= self.agregaPolyline({path:puntos,anchoLinea:3,flechas:true});
        callback({'data':data,'puntos':puntos}); 
     });




    //callback({'position':position,'direccion':dir});   
 }
/*
 * Elimina cualquier elemento del mapa.
 */
ncMaps.prototype.clearMap               =   function(){
    $.each(this.markerArray,function(i,obj){obj.setMap(null);});
    $.each(this.circuloArray,function(i,obj){obj.setMap(null);});
    $.each(this.polyArray,function(i,obj){obj.setMap(null);});
    $.each(this.direcArray,function(i,obj){obj.setMap(null);});
    $.each(this.polylineArray,function(i,obj){obj.setMap(null);});
    this.markerArray=[];
    this.circuloArray=[];
    this.polyArray=[];
    this.direcArray=[];
    this.polylineArray=[];
 }
/*
 *
 */
ncMaps.prototype.error                  =   function(err){
    
    console.log(err);
    return "->"+err.codigo;
 }
/*
 *
 */
ncMaps.prototype.loadScript              = function (url, callback){
    var script = document.createElement("script")
    script.type = "text/javascript";

    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function(){
            callback();
        };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}


