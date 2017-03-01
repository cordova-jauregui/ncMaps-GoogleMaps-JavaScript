/*
    ** ncMaps
    ** 
    **
    ** v 1.5.5 10/02/2017
    ** @Nestor Cordova 
 */
class ncMaps{
	constructor(mc,optMap){
	    if(typeof mc != 'object')	return 	this._mensaje("oMissing");
		if(!mc.idMapa) 				return 	this._mensaje("c-1");
	    !mc.apiKey				?		this._mensaje("c-2")	:	this.apiKey=mc.apiKey;
	    !mc.cargarMaps			?		mc.cargarMaps=true 		: 	"";
	    this.idMapa=mc.idMapa;
	   	this._iniciaVariablesInternas();
	    if (!window.google && mc.cargarMaps) {
	    	this._cargaGoogleMaps(mc,optMap);
	    }else if(!optMap)
	        this.iniciaMapa(optMap);
	 }
	ready(callback){
		let timer=setInterval(function(){
			if(window.google){
				clearInterval(timer);
				callback(this);	
			}
		}.bind(this),500);
	 }
	_cargaGoogleMaps(mc,optMap){
        let librerias="";
        if(mc.libraries){
            librerias="libraries=";
            mc.libraries.forEach(function(libreria,i){
                let c=",";
                if(i==mc.libraries.length-1)
                    c="";
                librerias+=libreria+c;
            });
         }
        let apiKey="";
        if (mc.apiKey){
            apiKey='&key='+mc.apiKey;
         }
        this.loadScript('https://maps.googleapis.com/maps/api/js?'+librerias+apiKey,() => this.iniciaMapa(optMap));
        return ;
	 }
	_iniciaVariablesInternas(){
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
	    this.callback=null;
	    this.estilizado=false;
	 }
	iniciaMapa(mpOpt={}){
	    !mpOpt.lat          ? this._mensaje('oDefault')		: "";
	    !mpOpt.lat 			? mpOpt.lat 		= 19.2469	: "";
	    !mpOpt.lng 	        ? mpOpt.lng 		= -103.7263	: "";
	    !mpOpt.zoom 		? mpOpt.zoom 		= 10		: "";
	    !mpOpt.zoomCtr 		? mpOpt.zoomCtr 	= true 		: ""; 
	    !mpOpt.ui 			? mpOpt.ui 			= true 		: "";
	    !mpOpt.tipoCtr    	? mpOpt.tipoCtr		= true 		: "";
	    !mpOpt.streetVie 	? mpOpt.streetView 	= true 		: "";
	    !mpOpt.latLng      	? mpOpt.latLng 		= new google.maps.LatLng(mpOpt.lat, mpOpt.lng):"";
	    !mpOpt.style       	? mpOpt.style 		= [{"featureType": "poi", "stylers": [{ "visibility": "off" }]}]:"";
	    this.originalPosition 					= mpOpt.latLng;
	    this.originalZoom 						= mpOpt.zoom;
	    let mapOptions = {
	        zoom					:	parseInt(mpOpt.zoom),
	        disableDefaultUI		:	mpOpt.ui,
	        mapTypeControl			:	mpOpt.tipoCtr,
	        mapTypeControlOptions	:	{
											position: google.maps.ControlPosition.RIGHT_BOTTOM   
										 },
	        streetViewControl		:	mpOpt.streetView,
	        zoomControl				: 	mpOpt.zoomCtr,
	        zoomControlOptions		:	{
					           				style: google.maps.ZoomControlStyle.large,
											position: google.maps.ControlPosition.RIGHT_CENTER  
										 },
	        center					:	mpOpt.latLng,
	        styles					:	mpOpt.style
	     };
	    this.mapa=new google.maps.Map(document.getElementById(this.idMapa),mapOptions);
	 }
	getLatLngUsuario(callback){
		var me=this;
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position){
				let latlng=me.latLng(position.coords.latitude,position.coords.longitude);
				callback({latLng:latlng,estado:"OK"});
			});
		} else { 
			callback({latLng:null,estado:"Geolocation is not supported by this browser."});
		}
	 }
	agregarCirculo(circOpt={}){
		/* - agregarCirculo - 
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
	    !circOpt.lat          	? this._mensaje('oDefault')				: "";
	    !circOpt.lat          	? circOpt.lat 			=	19.2469		: "";
	    !circOpt.lng          	? circOpt.lng 			=	-103.7263	: "";
	    !circOpt.latLng       	? circOpt.latLng		=	this.latLng(circOpt.lat,circOpt.lng):"";
	    !circOpt.color        	? circOpt.color			=	"#66CCFF"	: "";
	    !circOpt.opacidadColor	? circOpt.opacidadColor	=	0.5			: "";
	    !circOpt.colorBorde   	? circOpt.colorBorde	=	"#66F"		: "";
	    !circOpt.opacidadBorde	? circOpt.opacidadBorde	=	0.8			: "";
	    !circOpt.anchoBorde   	? circOpt.anchoBorde	=	2			: "";
	    !circOpt.editable     	? circOpt.editable 		=	false		: "";
	    !circOpt.clickable    	? circOpt.clickable		=	false		: "";
	    !circOpt.arrastrable  	? circOpt.arrastrable	=	false		: "";
	    !circOpt.radio        	? circOpt.radio			= 	1000 		: ""; 
	    !circOpt.mover        	? circOpt.mover			= 	true 		: "";
	    !circOpt.mapa 			? circOpt.mapa			=	this.mapa 	: "";
	    let circulo = new google.maps.Circle({
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
	agregarInfoWindow(infoWD={}){
		/*  - agregarInfoWindowfunction - 
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
	    if(!infoWD.marker)	return 	this._mensaje("ai-1");
	    !infoWD.contenido  	?		infoWD.contenido 	=	infoWD.marker.getTitle()	: 	"";
	    !infoWD.autoPan 	?		infoWD.autoPan 		=	false 						: 	"";
	    !infoWD.clickable	?		infoWD.clickable	=	true 						: 	"";
        let info = new google.maps.InfoWindow(	{
													disableAutoPan: infoWD.autoPan
												 });
        if(infoWD.clickable){
	        google.maps.event.addListener(infoWD.marker,"click", function() { 
	            info.setContent(infoWD.contenido);
	            info.open(infoWD.marker.getMap(),infoWD.marker); 
	         });
         }
        return info;  
	 }
	agregarMarcador(markOpt={}){
		/* - agregaMarcador -
		    *----------------
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
	    !markOpt.lat          	? this._mensaje('oDefault')					: "";
	    !markOpt.lat			? markOpt.lat			= 19.2469			: "";
	    !markOpt.lng			? markOpt.lng			= -103.7263			: "";
	    !markOpt.latLng			? markOpt.latLng		= new google.maps.LatLng(markOpt.lat, markOpt.lng):"";
	    !markOpt.arrastrable	? markOpt.arrastrable	= false				:"";
	    !markOpt.urlIcon		? markOpt.urlIcon		= ""				: ""; 
	    !markOpt.titulo			? markOpt.titulo		= "Marcador"		: "";
	    !markOpt.mapa			? markOpt.mapa			= this.mapa			: "";
	    !markOpt.mover			? markOpt.mover			= false				: "";
	    !markOpt.infoWindow		? markOpt.infoWindow	= false				: "";   
	    !markOpt.clickable		? markOpt.clickable		= true				: "";   
	    !markOpt.contenidoInfo	? markOpt.contenidoInfo	= markOpt.Titulo	: "";
	    !markOpt.zIndex			? markOpt.zIndex		= 1:"";
	    let opcionesMarca =	{
								position	: markOpt.latLng,
								icon		: markOpt.urlIcon,  
								title		: markOpt.titulo, 
								draggable	: markOpt.arrastrable,
								map			: markOpt.mapa,
								clickable	: markOpt.clickable,
								zIndex		: markOpt.zIndex
							 };
		let marker = new google.maps.Marker(opcionesMarca);
		if(markOpt.mover){
			this.moverMapa({latLng:marker.getPosition()});
	     }
	    this.markerArray.push(marker);
	    if(markOpt.infoWindow){
	        marker.infoWindow=this.agregarInfoWindow({
														marker		: marker,
														contenido	: markOpt.contenidoInfo
													 });
	     }

	    return marker;
	 }
	agregaPolygon(polyOpt){
		/* - agregaPolygon -
		    *    ----------------
		    *   Agrega una Polyline al mapa con parametros que se espesifican mediante un objeto.
		    *
		    *   Parametros: Recibe un objeto con los siguientes parametros. 
		    *   Ejemplo:    {lat:100,lng:200,color:'#FFAAFF',editable:true}
		    *
		    *   mpOpt.path            -> Los puntos que conforman la Polyline.
		    *   mpOpt.flechas           -> Muestra flechas direccionales en la Polyline
		    *   mpOpt.colorLinea        -> ...
		    *   mpOpt.opacidadLinea     -> ...  
		    *   mpOpt.anchoLinea        -> ...
		    *   mpOpt.opacidadLinea     -> ...
		 */
		if(typeof polyOpt != 'object')	return 	this._mensaje("oMissing");
	    if(!polyOpt.path)			return this._mensaje("oMissing");
		!polyOpt.mapa				? polyOpt.mapa=this.mapa:"";
		!polyOpt.color				? polyOpt.color="#00B8D4":"";
		!polyOpt.colorLinea			? polyOpt.colorLinea="#ffffff":"";
		!polyOpt.opacidadLinea		? polyOpt.opacidadLinea=1:"";
		!polyOpt.anchoLinea			? polyOpt.anchoLinea=1:"";
		!polyOpt.opacidadRelleno	? polyOpt.opacidadRelleno=1:"";
		!polyOpt.infoBox			? polyOpt.infoBox=false:"";
		!polyOpt.infoBoxContent		? polyOpt.infoBoxContent="---":"";
		!polyOpt.clickable			? polyOpt.clickable=true:"";
	    let polygon = new google.maps.Polygon(	{
													paths			: polyOpt.path,
													map				: polyOpt.mapa,
													strokeColor		: polyOpt.colorLinea, 
													fillColor		: polyOpt.color, 
													strokeOpacity	: polyOpt.opacidadLinea,
													fillOpacity		: polyOpt.opacidadRelleno,
													strokeWeight	: polyOpt.anchoLinea,
													clickable		: polyOpt.clickable,
													infoBox			: polyOpt.infoBoxEnable,
													infoBoxContent	: polyOpt.infoBoxContent
												 }); 
	    polygon.getBounds =()=>	{
											let bounds = new google.maps.LatLngBounds();
											this.getPath().forEach(function(element,index){bounds.extend(element)});
											return bounds;
										 };
	    polygon.getCenter =()=>	{
	    									return this.getBounds().getCenter();
	    								 };
	    if(this.infoBox){
	        let labelOptions=	{
						            content					: this.infoBoxContent,
						            boxStyle				: {
																textAlign	: "center",
																fontSize	: "8pt",
																width		: "50px"
															  },
	            					disableAutoPan			: true,
	            					pixelOffset				: new google.maps.Size(-25, 0),
	            					position				: this.getBounds().getCenter(),
	            					closeBoxURL				: "",
	            					isHidden				: false,
	            					pane					: "mapPane",
	            					enableEventPropagation	: true
	         };
	        polygon.infoBox = new InfoBox(labelOptions);
	        polygon.infoBox.open(polygon.getMap());
	     }
	 	this.polyGonArray.push(polygon);
	    return polygon;
	 }
	agregaPolyline(polyOpt){
		/* - agregaPolyline -
		    *    ----------------
		    *   Agrega una Polyline al mapa con parametros que se espesifican mediante un objeto.
		    *
		    *   Parametros: Recibe un objeto con los siguientes parametros. 
		    *   Ejemplo:    {lat:100,lng:200,color:'#FFAAFF',editable:true}
		    *
		    *   mpOpt.path            -> Los puntos que conforman la Polyline.
		    *   mpOpt.flechas           -> Muestra flechas direccionales en la Polyline
		    *   mpOpt.colorLinea        -> ...
		    *   mpOpt.opacidadLinea     -> ...  
		    *   mpOpt.anchoLinea        -> ...
		    *   mpOpt.opacidadLinea     -> ...
		 */
		if(typeof polyOpt != 'object')	return 	this._mensaje("oMissing");
	    if(!polyOpt.path)		return 	this._mensaje("ap-1");
		!polyOpt.flechas		? 		polyOpt.flechas			= false		: "";
		!polyOpt.colorLinea		? 		polyOpt.colorLinea		= "#336666"	: "";
		!polyOpt.opacidadLinea	? 		polyOpt.opacidadLinea	= 1			: "";
		!polyOpt.anchoLinea		? 		polyOpt.anchoLinea		= 2			: "";
		!polyOpt.mapa			?		polyOpt.mapa			= this.mapa	: "";
		!polyOpt.banderas		? 		polyOpt.banderas		= false		: ""; 
		!polyOpt.velocidad		? 		polyOpt.velocidad		= 100		: ""; 
	    !polyOpt.mostrara		?		polyOpt.mostrar			= false		: ""; 
		let polyline;
	    if(polyOpt.banderas){
	        this.agregarMarcador({
	        						titulo:"Origen",
	        						latLng:polyOpt.path[0],urlIcon:'http://maps.google.com/mapfiles/ms/micons/blue.png'}
	        					 );
	        this.agregarMarcador({
	        						titulo:"Destino",
	        						latLng:polyOpt.path[polyOpt.path.length-1],urlIcon:'http://maps.google.com/mapfiles/ms/micons/red-dot.png'}
	        					 );
	     }
	    let simbolo_flecha = "";
	    if(polyOpt.flechas)
	        simbolo_flecha = {
								path			: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
								strokeOpacity	: 1,
								strokeWeight	: 1,
								scale			: 2,
								fillColor		: polyOpt.colorLinea,
								fillOpacity		: 1
							 };     
		polyline = new google.maps.Polyline({
	        path:polyOpt.path,
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
	    if(polyOpt.mostrar)
	    	polyline.setMap(this.mapa);

		this.polylineArray.push(polyline);
	    return polyline;
	 }
	getIndicaciones(directOpt,callback){
		/* - getIndicaciones -
		    *    ----------------
		    *   Obtiene la direccion de un punto a otro y la muestra en el mapa con parametros que se espesifican mediante un objeto.
		    *
		    *   Parametros: Recibe un objeto con los siguientes parametros. 
		    *   Ejemplo:    {origen:'Colima Col.',destino:'Manzanillo Col.'}
		    *
		    *   mpOpt.origen            -> latitude o nombre del lugar de origen.
		    *   mpOpt.destino           -> longitude o nombre del lugar de destino.
		    *   mpOpt.pathObligados   -> Puntos por los que debe pasar la ruta de forma obligada.
		    *   mpOpt.travelMode        -> Tipo de recorrido, Auto, bici, a pie.
		    *   mpOpt.verDistancia      -> Mostrar la distancia total del recorrido.
		    *   mpOpt.preserveViewport  -> Conservar la vista del mapa actual.
		    *   mpOpt.draggable         -> Permite mover los puntos de la ruta.
		 */
		$("#mAkmToNsUn").remove();
	    this.direcArray.forEach(oDireccion=>{oDireccion.setMap(null);});
	    if(!directOpt.origen)		return 	this._mensaje("gd-1");
	    if(!directOpt.destino)		return 	this._mensaje("gd-2");
	    !directOpt.pathObligados	?		directOpt.pathObligados		= []		: "";
	    !directOpt.modeDeViaje		?		directOpt.modeDeViaje		= "DRIVING"	: "";
	    !directOpt.verDistancia		?		directOpt.verDistancia		= false		: "";
	    !directOpt.preserveViewport	?		directOpt.preserveViewport	= true		: "";
	    !directOpt.suppressMarkers	?		directOpt.suppressMarkers	= false		: "";
	    !directOpt.suppressPolylines?		directOpt.suppressPolylines	= false		: "";
	    !directOpt.mapa				?		directOpt.mapa				= this.mapa	: "";
	    !directOpt.draggable		?		directOpt.draggable			= false		: "";
	    !callback					?		callback					= null		: "";
	    !directOpt.verIndicaciones	?		directOpt.verIndicaciones	= false		: "";
	    var callbackData		= {};
	   	let _travelMode			= null;
	    let _waypoints			= [];
		let directionsService	= new google.maps.DirectionsService;
		let directionsDisplay	= new google.maps.DirectionsRenderer;
	    let start				= directOpt.origen;
	    let end					= directOpt.destino;
		/*----------------------Funciones Internas-------------------*/
			let _generaEstilos			=	()				=>{
				let css=`#ncIndicacionesPanel{
					font-family: 'Roboto','sans-serif';
					line-height: 30px;
					border: 1px solid #DDD;
					background-color: white;
					width:0;
					overflow: hidden;
					float: right;
							}
				#ncPanelContent{
					overflow-y: scroll;
					overflow-x: hidden;
					width: 300px;
					padding:0 10px;
					height: 100%;
					
				}
				#ncPanelContent table tr:hover{background-color:#ddd;}
				.mapaConDirectionPanel{float:left;}`;
				let style = document.createElement("style");
				style.type = 'text/css';
				if (style.styleSheet){
					style.styleSheet.cssText = css;
				} else {
					style.appendChild(document.createTextNode(css));
				}
				document.head.appendChild(style);
			 }
			let _ajustaAnchoDeMapa		=	(o)				=>{
				$(`#${o.idMapa}`).addClass("mapaConDirectionPanel");
				$(`#${o.idMapa}`).animate({width:'-=300'},300);
				$(`#ncIndicacionesPanel`).animate({width:300},350);
			 }
			let _generaNcPanelDiv		=	(o)				=>{
				$("#ncIndicacionesPanel").remove();
				let ncPanel=`<div id="ncIndicacionesPanel" class="ncIndicationElement"><div id="ncPanelContent"><center>¿Comó llegar?</center></div></div>`;
				$(`#${o.idMapa}`).parent().append(ncPanel);
				let oMapa=$(`#${o.idMapa}`);
				$("#ncIndicacionesPanel").height(oMapa.height() - 2);
			 }
			let _generaIndicacionesPanel=	()				=>{
			if(!directOpt.verIndicaciones)
					return ;
				directionsDisplay.setMap(directOpt.mapa);
				if(!this.estilizado){
					_generaEstilos();
					this.estilizado=true;
				 }
				_generaNcPanelDiv(this);
				directionsDisplay.setPanel(document.getElementById('ncPanelContent'));
			 }
			let _generaModoDeViaje		=	(modoDeViaje)	=>{
				switch(modoDeViaje.toUpperCase()){
					case "BICYCLING":
						return google.maps.TravelMode.BICYCLING;
					 break;
					case "TRANSIT":
						return google.maps.TravelMode.TRANSIT;
					 break;
					case "WALKING":
						return google.maps.TravelMode.WALKING;
					 break;
					default:
						return google.maps.TravelMode.DRIVING;
					 break;
				}
			 };
			let _kilometrosTotales		=	(oResult)		=>{
				let total 	= 0;
				let myroute = oResult.routes[0];
				for (let i = 0; i < myroute.legs.length; i++) {
					total += myroute.legs[i].distance.value;
				}
				total = total / 1000;
				return total + ' km';
			 }
			let _puntosObligados		=	()				=>{
				if(!directOpt.pathObligados)
					return ;
				directOpt.pathObligados.forEach(po=>{
					_waypoints.push({location:po});
				});
			 };
		/*--------------------Fin Funciones Internas-----------------*/
		_generaIndicacionesPanel();
		_puntosObligados();
		_travelMode=_generaModoDeViaje(directOpt.modeDeViaje);
		if(directOpt.verDistancia){
			google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {
				let tKm=_kilometrosTotales(directionsDisplay.getDirections());
				if($("#mAkmToNsUn")[0]==undefined)
					$("#"+this.idMapa).append("<div id='mAkmToNsUn' class='ncIndicationElement'>Distancia: "+tKm+"</div>");
				else
					$("#mAkmToNsUn").html("Distancia: "+tKm);
				if($("#styleMn3X")[0]==undefined)
					$("head").append("<style id='styleMn3X'>#mAkmToNsUn{position:absolute;background-color:#3367D6;color:white;padding:10px;margin:10px;border-radius:3px;bottom:0px;-webkit-transition: background-color 2s ease-out;-moz-transition: background-color 10s ease-out;-o-transition: background-color 10s ease-out;transition: background-color 10s ease-out;}#mAkmToNsUn:hover{background-color: red;cursor:pointer}</style>")
			}.bind(this));
		}	   
	    let request = {
	        origin				: start,
	        destination			: end,
	        waypoints			: _waypoints,
	        travelMode			: _travelMode,
	        durationInTraffic	: true,
	        unitSystem			: google.maps.UnitSystem.METRIC
		};	
	    directionsService.route(request, function(result, status) {
	        if (status == google.maps.DirectionsStatus.OK) {
				directionsDisplay.setOptions({suppressMarkers: directOpt.suppressMarkers,suppressPolylines:directOpt.suppressPolylines});
	            directionsDisplay.setDirections(result);
				_ajustaAnchoDeMapa(this);
	            this.direcArray.push(directionsDisplay);
	            callbackData.oDirectionsDisplay 	= directionsDisplay;
	            callbackData.duracion				= directionsDisplay.directions.routes[0].legs[0].duration.text;
	            callbackData.distancia				= directionsDisplay.directions.routes[0].legs[0].distance.text.replace(",",".");
	            if(callback!=null)
	                callback(callbackData);
	            
	        }
	    }.bind(this));
	 }
	limpiaIndicaciones(){
		if(!this.direcArray.length)
			return;
		let idMapa=this.idMapa;
		this.direcArray.forEach(obj=>{obj.setMap(null);});
		this.direcArray=[];
		$(`#${idMapa}`).animate({width:'+=300'},350,function(){
			$(`#${idMapa}`).removeClass("mapaConDirectionPanel");
		});
		$(".ncIndicationElement").animate({width:0},300,function(){
			$(this).remove();
		});
	 }
	getDistancia(disOpt){
		/* - getDistancia -
		    *    ----------------
		    *   Obtiene la distancia de un marcador a otro.
		    *
		    *   Parametros: Recibe un objeto con los siguientes parametros. 
		    *   Ejemplo:    {unidadMetrica:'m'}
		    *
		    *   mpOpt.origen      -> (marker), marcador inicial
		    *   mpOpt.destino        -> (marker), marcador destino.
		    *   mpOpt.unidadMetrica   -> Medida en la que se mostrara la distancia (cm,m,km)
		    *
		 */
		if(typeof disOpt != 'object')	return 	this._mensaje("oMissing");
	    if(!disOpt.origen)			return 	this._mensaje("gd-1");
	    if(!disOpt.destino)			return 	this._mensaje("gd-2");
	    !disOpt.unidadMetrica		?		disOpt.unidadMetrica	=	"m"	: ""; 
	    try{
   			let unidadMetrica	= {corto:"",largo:""};
	        let distancia		= google.maps.geometry.spherical.computeDistanceBetween(disOpt.origen, disOpt.destino);
	        switch(disOpt.unidadMetrica){
	            case "cm":
	                distancia=(distancia*100).toFixed(2);
	                unidadMetrica.corto="Centimetros";
	                unidadMetrica.largo="cm";
	            break;
	            case "m":
	                distancia=distancia.toFixed(2);
	                unidadMetrica.corto="Metros";
	                unidadMetrica.largo="m";
	            break;
	            case "km":
	                distancia=(distancia/100).toFixed(2);
	                unidadMetrica.corto="Kilometros";
	                unidadMetrica.largo="km";
	            break;
	    	} 
	    	return {distancia,unidadMetrica};
	    }catch(err){
	    	console.log(err);
	   	}
	 } 
	getDistanciaLineal(disLinOpt){
		/* -getDistanciaLineal-
			*
		 */
        if(typeof disLinOpt != 'object')	return 	this._mensaje("oMissing");
        if(!disLinOpt.origen)	return this._mensaje("gd-1");
        if(!disLinOpt.destino)	return this._mensaje("gd-2");
        let rad		=(x)=>{
            return x * Math.PI / 180;
         };
        let R		= 6378137; // Earth’s mean radius in meter
        let dLat	= rad(disLinOpt.destino.lat()- disLinOpt.origen.lat());
        let dLong	= rad(disLinOpt.destino.lng()- disLinOpt.origen.lng());
        let a 		= Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(disLinOpt.origen.lat())) * Math.cos(rad(disLinOpt.destino.lat())) *Math.sin(dLong / 2) * Math.sin(dLong / 2);
        let c		= 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d		= (R * c).toFixed(2);
        let distancia={distancia:d,unidadMetrica:{corto:"m",largo:"Metros"}};
        return distancia; // returns the distance in meter
     }	
	getRumboText(rumbo){
		/* - getRumboText - 
			*
	 	*/
	    switch (rumbo){
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
	getZoom(){
	    return this.mapa.getZoom();
	 }
	getDireccionDePunto(latLng,callback){
		/* - getDireccionDePunto - 
			*
	 	*/
	    if(!latLng)		return 	this._mensaje("oLatLngMissing");
	    !callback		?		this._mensaje("cMissing")	: "";
	    let geocoder 	= 		new google.maps.Geocoder();
	    geocoder.geocode({
	    	'location':latLng
	      },function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                let direccion	= results[0].formatted_address;
                let allData		= results[0];
                if(callback)
                	callback({direccion,allData});
                else
                	console.log(direccion);
            } else {
                window.alert('Google no pudo encontrar a la dirección: ' + status);
            }
         });
	 }
	getPuntoDeDireccion(addressOpt,callback){
		/* - getPositionByAddress - 
			*
	 	*/
	    if(typeof addressOpt != 'object')	return 	this._mensaje("oMissing");
	    !callback					?   	this._mensaje("cMissing")			: "";
	    !addressOpt.pais			?		addressOpt.pais			= "MX"		: "";
	    !addressOpt.codigoPostal	?		addressOpt.codigoPostal	= "28000"	: "";
	    !addressOpt.direccion		?		addressOpt.direccion	= "Colima"	: "";
	    !addressOpt.location		?		addressOpt.location		= false		: "";
	    !addressOpt.latLngBounds	?		addressOpt.latLngBounds	= false		: "";
	    !addressOpt.restrictions	?		addressOpt.restrictions	= false		: "";
	    !addressOpt.restrictions	?		addressOpt.restrictions	= {}		: addressOpt.restrictions={country: addressOpt.pais,postalCode: addressOpt.codigoPostal};
	    let geocoder	= new google.maps.Geocoder();
	    let request		= {};
	    if(addressOpt.direccion)
	        request.address=addressOpt.direccion;
	    if(addressOpt.location)
			request.location=addressOpt.location;
	    if(addressOpt.latLngBounds){
	        let v		= addressOpt.latLngBounds;
	        let bounds	= new google.maps.LatLngBounds();
	        bounds.extend(v.a);
	        bounds.extend(v.b);
	        request.bounds=bounds;
	     }
	    geocoder.geocode(
	        request,
	    	function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                let punto=results[0].geometry.location;
                let direccion=results[0].formatted_address;
                if(callback)
                	callback({punto,direccion});  
                else
                	console.log(punto,direccion);  
            } else {
                if(!addressOpt.restrictions.pais){
                    console.log('otra oportunidad');
                    this.getPositionByAddress({restrictions:false,direccion: addressOpt.direccion,content:addressOpt.content});
                }else
                    window.alert('Google no pudo encontrar el punto ' + status);
            }
        }.bind(this));
	 }
	iniciaSearchBox(objSearch={}){//fix
		/*
			*
		*/
	    !objSearch.texto					?   this._mensaje("oDefault"):"";
	    !objSearch.texto					?   objSearch.texto="¿Qué es lo que buscas?":"";
	    !objSearch.change					?   objSearch.change=false:"";
	    !objSearch.autoReturnToPosition		?   objSearch.autoReturnToPosition=false:"";
	    let input =$('<input type="text" id="search" class="form-control" placeholder="'+objSearch.texto+'" style="padding:10px;background-color:rgba(255,255,255,0.93);margin:10px 0 0 10px;width:35%;max-width:500px;border: 1px solid #BFBFBF;">')[0];
	    let cl=$('<i id="clSrc" class="glyphicon glyphicon-remove" style="display:none;margin:10px 0 0 -20px;line-height:30px;color:gray;cursor:pointer;font-size:15px;width:20px;background-color: white;"></i>')[0];
	    try{
	        new google.maps.places.SearchBox(($("<input>")[0]));
	    }catch(err){
	        console.log("Error: Se requiere la libreria 'Places'");
	        return ;
	    }
	    /*Genera los elementos html en el mapa*/
	    this.mapa.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
	    this.mapa.controls[google.maps.ControlPosition.TOP_LEFT].push(cl);
	   
	    /*Inicializa las funciones jquery para la busqueda, retraso 2s*/
	    var ax=setInterval(function(){
	        clearInterval(ax);
	        $("#clSrc").click(function(){
	            $("#clSrc").fadeOut(500);
	            $("#search").val("");
	        if(objSearch.autoReturnToPosition){
	            ()=> this.mapa.panTo(()=> this.originalPosition);
	            ()=> this.mapa.setZoom(()=> this.originalZoom);
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
	    ()=> this.searchBox.setBounds(()=> this.mapa.getBounds());
	    this.mapa.addListener('bounds_changed', function() {
	        ()=> this.searchBox.setBounds(()=> this.mapa.getBounds());
	    });
	    this.searchBox.addListener('places_changed', function() {
	        let places = ()=> this.searchBox.getPlaces();
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
	        searchBoxMarker= ()=> this.agregarMarcador({lat:p.lat(),lng:p.lng(),titulo:place.name,mover:true});
	    });
	 }
	latLngBounds(ne,sw){
	    return new google.maps.LatLngBounds(ne,sw);
	 };
	latLng(lat,lng){
		return new google.maps.LatLng(parseFloat(lat),parseFloat(lng));
	 }
	generaKMLsByPoints(generaKML){//fix
	    if(generaKML==undefined){return this._mensaje({"error":"generaKML","codigo":1})};
	    if(generaKML.path==undefined){return this._mensaje({"error":"generaKML","codigo":2})};
	    generaKML.titulo==undefined?generaKML.titulo="Ruta":""; 
	    var _coordinates="";
	    generaKML.path.forEach(p=>{
	        _coordinates+=p.F+','+p.A+','+'0 ';
	     });
	    let _xml='<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom"><Document><name>'+generaKML.titulo+'.kml</name><StyleMap id="msn_ylw-pushpin"><Pair><key>normal</key><styleUrl>#sn_ylw-pushpin</styleUrl></Pair><Pair><key>highlight</key><styleUrl>#sh_ylw-pushpin</styleUrl></Pair></StyleMap><Style id="sh_ylw-pushpin"><IconStyle><scale>1.3</scale><Icon><href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href></Icon><hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/></IconStyle><LineStyle><color>ccff6a00</color><width>4</width></LineStyle></Style><Style id="sn_ylw-pushpin"><IconStyle><scale>1.1</scale><Icon><href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href></Icon><hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/></IconStyle><LineStyle><color>ccff6a00</color><width>4</width></LineStyle></Style><Placemark><name>'+generaKML.titulo+'</name><styleUrl>#msn_ylw-pushpin</styleUrl><LineString><tessellate>1</tessellate><coordinates>'+_coordinates+'</coordinates></LineString></Placemark></Document></kml>';
	    return _xml;
	 }
	autoZoom(objAz){
		/* - autoZoom -
			* Ajusta el zoom del mapa para mostrar todos los marcadores.
	 	*/
	    if(typeof objAz != 'object')	return 	this._mensaje("oMissing");
	    if(!objAz.path)		return this._mensaje("ap-1");
	    !objAz.tipo				?		this._mensaje("oDefault")	: ""; 
	    !objAz.tipo				?		objAz.tipo	= "latlng"		: ""; 
	    !objAz.qZoom			?		objAz.qZoom	= 		0		: ""; 
	    var latlngbounds = new google.maps.LatLngBounds();
	    objAz.path.forEach(o=>{
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
	moverMapa(moverOpt){
	    if(typeof moverOpt != 'object')	return 	this._mensaje("oMissing");
	    !moverOpt.lat     ? moverOpt.lat	= 19.2469:"";
	    !moverOpt.lng     ? moverOpt.lng	= -103.7263:"";
	    !moverOpt.latLng  ? moverOpt.latLng	= this.latLng(moverOpt.lat, moverOpt.lng):"";
	    this.mapa.panTo(moverOpt.latLng);
	 }
	getLimitesVisibles(){
		/*
			* Obtiene los limites de vision del mapa, (4 puntos cardinales de las esquinas)
			*
		 */
        let bounds=this.mapa.getBounds();
        let NorthEast = bounds.getNorthEast();
        let SouthWest = bounds.getSouthWest();
        let NE=this.latLng(NorthEast.lat(), NorthEast.lng());
        let SE=this.latLng(SouthWest.lat(), NorthEast.lng());
        let SO=this.latLng(SouthWest.lat(),SouthWest.lng());
        let NO=this.latLng(NorthEast.lat(),SouthWest.lng());
        let puntos= {NE,SE,SO,NO};
        return puntos;
	 }
	pointToTrazo(point){//EVALUAR
	    if(point==null)
	        return "Se requiere array de coordenadas:[{long,lat}]";
	    let points=point.replace(/["'()]/g,"").replace(/POINT /g,"").split(",");
	    var path= new Array();
	    points.forEach(p=>{
	         p=p.split(" ");
	        lt=new google.maps.LatLng(p[1],p[0]);
	        path.push(lt);
	    });
	    let trazoCodificado = google.maps.geometry.encoding.encodePath(path);
	    return trazoCodificado;
	 }
	polygonToTrazo(POLYGON){//EVALUAR
	    if(POLYGON==null)
	        return "Se requiere array de coordenadas:[{long,lat},{long,lat}]";
	    let points=POLYGON.replace(/["'()]/g,"").replace(/POLYGON/g,"").split(",");

	    var path= new Array();
	    points.forEach(p=>{
	        p=p.split(" ");
	        lt=new google.maps.LatLng(p[1],p[0]);
	        path.push(lt);
	    });
	    let trazoCodificado = google.maps.geometry.encoding.encodePath(path);
	    return trazoCodificado;
	 }
	trazoToPath(trazo){
	    return google.maps.geometry.encoding.decodePath(trazo);
	 }
	reajustar(){
	    google.maps.event.trigger(this.mapa, "resize");
	 }
	generaPanorama(panoramaOpt){
		if(typeof panoramaOpt != 'object')	return 	this._mensaje("oMissing");
		if(!panoramaOpt)					return 	this._mensaje("oMissing");
	    if(!panoramaOpt.div)				return	this._mensaje("c-1");
	    if(!panoramaOpt.latLng)				return 	this._mensaje("oLatLngMissing");
	    !panoramaOpt.mostrar	?		panoramaOpt.mostrar		= true	: ""; 
	    if(this.panorama){
	    	this.mapa.setStreetView(null);
	    	this.panorama=null;
	    }
		this.panorama = new google.maps.StreetViewPanorama(
	      document.getElementById(panoramaOpt.div), {
	        position: panoramaOpt.latLng,
	        visible: true,
            linksControl: false,
            panControl: false,
            addressControl: true,
            zoomControlOptions: {
              style: google.maps.ZoomControlStyle.SMALL
            },
            enableCloseButton: false
	      });
		if(panoramaOpt.mostra)
			this.setPanorama();
	 }
	getPanorama(){
		return this.panorama;
	 }
	setPanorama(panorama){
		if(!panorama)
			panorama=this.panorama;
			try{
				this.mapa.setStreetView(panorama);
			}catch(err){console.log(err);}
	 }
	snapedRoad(spRopt,callback){
 		if(typeof spRopt != 'object')	return 	this._mensaje("oMissing");
	    if(!spRopt.path)	return	this._mensaje("ap-1");
	    if(!this.apiKey)	return	this._mensaje("apiKeyMissing");
	    !spRopt.interpolate	?		spRopt.interpolate	= true	: "";
	    var self=this;
	    var pathValues 	= [];
	    var puntos		= [];
	    spRopt.path.forEach(d=>{
	        pathValues.push(d.toUrlValue());
	     });
	    $.get('https://roads.googleapis.com/v1/snapToRoads', {
	        interpolate: spRopt.interpolate,
	        key: self.apiKey,
	        path: pathValues.join('|')
	      },function(data) {
	    	data.snappedPoints.forEach(d=>{
	           let latlng=self.latLng(d.location.latitude,d.location.longitude);
	           puntos.push(latlng);
	         });
	        //snappedPolyline= ()=>.agregaPolyline({path:puntos,anchoLinea:3,flechas:true});
	        callback({'data':data,'puntos':puntos}); 
	     });




	    //callback({'position':position,'direccion':dir});   
	 }
	clearMap(){
		this.markerArray.forEach(obj=>{obj.setMap(null);});
		this.circuloArray.forEach(obj=>{obj.setMap(null);});
		this.polyArray.forEach(obj=>{obj.setMap(null);});
		this.direcArray.forEach(obj=>{obj.setMap(null);});
		this.polylineArray.forEach(obj=>{obj.setMap(null);});
	    $("#mAkmToNsUn").remove();
	    this.markerArray=[];
	    this.circuloArray=[];
	    this.polyArray=[];
	    this.direcArray=[];
	    this.polylineArray=[];
	 }
	_mensaje(codigo){
		let mensaje;
	    switch(codigo){
	    	case "oDefault":
	    		mensaje="Advertencia: Se inicia el elemento sin parametros.";
	    	 break;
	    	case "oMissing":
	    		mensaje="Error: Se requiere objeto de configuracion.";
	    	 break;
	    	case "c-1":
	    		mensaje="Error: Se requiere el id HTML donde se iniciara el mapa.";
	    	 break;
	    	case "c-2":
	    		mensaje="Advertencia: Ingresa tu apiKey de Google Maps";
	    	 break;
	    	case "ai-1":
	    		mensaje="Error: Se requiere un marcador -> {}.marker";
	    	 break;

	    	case "ap-1":
	    		mensaje="Error: Se requiere path con puntos.";
	    	 break;
	    	case "gd-1":
	    		mensaje="Error: No se ingreso el origen.";
	    	 break;
	    	case "gd-2":
	    		mensaje="Error: No se ingreso el destino";
	    	  break;
	    	case "oLatLngMissing":
	    		mensaje="Error: Se esperaban objetos latLng.";
	    	 break;
	    	case "cMissing":
	    		mensaje="Advertencia: No se detecto callback";
	    	 break;
	    	case "az-1":
	    		mensaje="Error: Se requiere el parametro tipo";
	    	 break;
	    	case "apiKeyMissing":
	    		mensaje="Error: Se requiere tener una apiKey.";
	    	 break;
	    	default:
	    		mensaje=":)";
	    	 break;
	    	
	    }
	    return mensaje;
	 }
	loadScript(url,callback){
		let script = document.createElement("script");
	    script.type = "text/javascript";
	    if (script.readyState)  //IE
	        script.onreadystatechange =()=>{
	            if (script.readyState == "loaded" ||
	                    script.readyState == "complete"){
	                script.onreadystatechange = null;
	                callback();
	            }
	        };
	    else  //Others
	        script.onload =()=>{
	            callback();
	        };
	    script.src = url;
	    document.getElementsByTagName("head")[0].appendChild(script);
	 }
}