
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

var isci = ["krneki"];

google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(function() {
    drawChart([], [], [], [], "teze");
    drawChart([], [], [], [], "pritisk");
});


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
function generirajPodatke(stPacienta) {
  ehrId = "";
  sessionId = getSessionId();
  
  if(stPacienta == 1) {
      var ime = "Sneguljčica";
      var priimek = "BelaKotSneg";
      var datumRojstva = "1854-03-12";
      var naslov = "Ljubljana";
      
      var meritve = {
        datumMeritve: ["2015-10-11", "2015-12-06", "2016-01-31", "2016-04-15"],
        visina: [167, 167, 167, 167],
        teza: [57.00, 57.20, 58.50, 61.50],
        tromesecje: ["Pred nosečnostjo", "1. tromesečje", "1. tromesečje", "2. tromesečje"],
        sistolicniTlak: [115, 120, 117, 115], //v mejah normale
        diastolicniTlak: [70, 75, 70, 73]
      }
  } else if(stPacienta == 2) {
      var ime = "Pepelka";
      var priimek = "Pepelnata";
      var datumRojstva = "1697-06-08";
      var naslov = "Bled";
      
      var meritve = {
        datumMeritve: ["2015-08-03", "2015-10-06", "2015-12-20", "2016-02-22",
            "2016-03-17", "2016-05-05"],
        visina: [165, 165, 165, 165, 165, 165],
        teza: [55.00, 55.00, 56.70, 61.50, 63.80, 65.30],
        tromesecje: ["Pred nosečnostjo", "1. tromesečje", "1. tromesečje", "2. tromesečje", "2. tromesečje", "3. tromesečje"],
        sistolicniTlak: [95, 98, 96, 100, 96, 116], //rahlo povisan
        diastolicniTlak: [63, 65, 63, 69, 68, 80]
      }
  } else if(stPacienta == 3) {
      var ime = "Trnuljčica";
      var priimek = "Zaspana";
      var datumRojstva = "1697-10-21";
      var naslov = "Maribor";
      
      var meritve = {
        datumMeritve: ["2016-01-31", "2016-03-11", "2016-04-15"],
        visina: [163, 163, 163],
        teza: [50.30, 50.60, 51.60],
        tromesecje: ["Pred nosečnostjo", "1. tromesečje", "1. tromesečje"],
        sistolicniTlak: [108, 112, 144], //zelo povisan
        diastolicniTlak: [71, 72, 91]
      }
  }

        $.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: datumRojstva,
		            address: {
		                address: naslov
		            },
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
                            
                            var el = $("#podatkiONosecki");
                            var opt = document.createElement('p');
                            var text = "Kreiran je nov EHR " + ehrId;
                            opt.textContent = text;
                            el.append(opt);
                            
                          
		                    $("#preberiEHRid").val(ehrId);
		                    var element = $("#preberiObstojeciEHR");
		                    var option = document.createElement('option');
		                    var text = partyData.firstNames + " " + partyData.lastNames;
		                    option.value = ehrId;
		                    option.textContent = text;
		                    element.append(option);
		                }
		                
		                for(var i=0; i<meritve.visina.length; i++) {
		                    dodajMeritve(ehrId, meritve, i);
		                }
		                console.log(ehrId);
		            },
		            error: function(err) {
		            	$("#kreirajSporocilo").html("<span class='obvestilo label " +
                    "label-danger fade-in'>Napaka '" +
                    JSON.parse(err.responseText).userMessage + "'!");
		            }
		        });
		    }
		 });
    
  return ehrId;
}

function dodajMeritveVitalnihZnakov() {
    sessionId = getSessionId();
    $("#dodajMeritveVitalnihZnakovSporocilo").html("");
    
    var ehrId = $("#preberiEHRid").val();
    
    console.log("Ehr za dodajanje: " + ehrId);
    
    var izbranoTromesecje = $("input[name='izberiTromesecje']:checked").val();
    
    var datum = $("#dodajDatum").val();
    var visina = $("#dodajVisina").val();
    var teza = $("#dodajTeza").val();
    var sistolicniTlak = $("#dodajTlakSistolicni").val();
    var diastolicniTlak = $("#dodajTlakDiastolicni").val();
    
    
    if(ehrId == undefined) {
        $("#dodajMeritveVitalnihZnakovSporocilo").html(
        "<span class='obvestilo label label-danger fade-in'>Izbrana ni nobena uporabnica.");
    } else {
        if(izbranoTromesecje == undefined) {
    	    $("#dodajMeritveVitalnihZnakovSporocilo").html(
            "<span class='obvestilo label label-danger fade-in'>Prosim, izberi tromesečje.");
        } else if(datum == "" || visina == "" || teza == "" || sistolicniTlak == "" || diastolicniTlak == "") {
            $("#dodajMeritveVitalnihZnakovSporocilo").html(
            "<span class='obvestilo label label-danger fade-in'>Prosim, vnesi manjkajoče podatke.");
        } else {
            var meritve = {
                datumMeritve: datum,
                visina: visina,
                teza: teza,
                sistolicniTlak: sistolicniTlak,
                diastolicniTlak: diastolicniTlak,
                tromesecje: izbranoTromesecje
            }
            
            dodajMeritve(ehrId, meritve, -1);
            
        }
    }
}

function dodajMeritve(ehrId, meritve, index) {
    sessionId = getSessionId();
    
        $.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		
		if(index == -1) {
		    var podatki = {
    		    "ctx/language": "en",
    		    "ctx/territory": "SI",
    		    "ctx/time": meritve.datumMeritve,
    		    "vital_signs/height_length/any_event/body_height_length": meritve.visina,
    		    "vital_signs/body_weight/any_event/body_weight": meritve.teza,
    		    "vital_signs/pulse/any_event/comment": meritve.tromesecje, //samo pri pulzu shrani komentar
    		    "vital_signs/blood_pressure/any_event/systolic": meritve.sistolicniTlak,
    		    "vital_signs/blood_pressure/any_event/diastolic": meritve.diastolicniTlak
		    };
		    
		    var parametriZahteve = {
    		    ehrId: ehrId,
    		    templateId: 'Vital Signs',
    		    format: 'FLAT',
    		    committer: "Nosečka"
    		};
    		
    		
    		var poizvedba = $.ajax({
                    		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
                    		    type: 'POST',
                    		    contentType: 'application/json',
                    		    data: JSON.stringify(podatki),
                    		    async: false
            });
            
            $("#dodajMeritveVitalnihZnakovSporocilo").html(
            "<span class='obvestilo label label-success fade-in'>Meritev je bila uspešno vnešena.");
            
            preberiEHR();
            
		} else {
			var podatki = {
    		    "ctx/language": "en",
    		    "ctx/territory": "SI",
    		    "ctx/time": meritve.datumMeritve[index],
    		    "vital_signs/height_length/any_event/body_height_length": meritve.visina[index],
    		    "vital_signs/body_weight/any_event/body_weight": meritve.teza[index],
    		    "vital_signs/pulse/any_event/comment": meritve.tromesecje[index], //samo pri pulzu shrani komentar
    		    "vital_signs/blood_pressure/any_event/systolic": meritve.sistolicniTlak[index],
    		    "vital_signs/blood_pressure/any_event/diastolic": meritve.diastolicniTlak[index]
    		};
    		
    		
    		var parametriZahteve = {
    		    ehrId: ehrId,
    		    templateId: 'Vital Signs',
    		    format: 'FLAT',
    		    committer: "Nosečka"
    		};
    		
    		
    		var poizvedba = $.ajax({
                    		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
                    		    type: 'POST',
                    		    contentType: 'application/json',
                    		    data: JSON.stringify(podatki),
                    		    async: false
            });
		}
}

function preberiEHR() {
	sessionId = getSessionId();

	var ehrId = $("#preberiEHRid").val();
	
	$("#priporocilo").html("");

	if (!ehrId || ehrId.trim().length == 0) {
		$("#preberiSporocilo").html("<span class='obvestilo label label-warning " +
      "fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				
				if(party.dateOfBirth == undefined) {
				    var datumRojstva = "Ni podatka"
				} else {
				    var razclenjenDatum = party.dateOfBirth.split("T");
				    var datumRojstva = razclenjenDatum[0];
				}
				
				if(party.address == undefined) {
				    var kraj = "Ni podatka";
				} else {
				    var kraj = party.address.address;
				}
				
				$("#podatkiONosecki").html("<p class='text-left'><b>Ime in priimek:</b> " + party.firstNames + " " + party.lastNames + "</p>" +
				"<p class='text-left'><b>Datum rojstva:</b> " + datumRojstva + "</p>" +
				"<p class='text-left'><b>Kraj bivanja:</b> " + kraj + "</p>");
				
				var AQL =
				    "select " +
				    "a_b/data[at0002]/events[at0003]/time/value as time, " +
                    "a_b/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as weight, " + 
                    "a_c/data[at0001]/events[at0006]/data[at0003]/items[at0004]/value/magnitude as systolic, " + 
                    "a_d/data[at0002]/events[at0003]/data[at0001]/items[at0009]/value/value as comment, " + 
                    "a_c/data[at0001]/events[at0006]/data[at0003]/items[at0005]/value/magnitude as diastolic " + 
                    "from EHR e[ehr_id/value='" + ehrId + "'] " + 
                    "contains COMPOSITION a " + 
                    "contains ( " + 
                    "OBSERVATION a_b[openEHR-EHR-OBSERVATION.body_weight.v1] or " + 
                    "OBSERVATION a_c[openEHR-EHR-OBSERVATION.blood_pressure.v1] or " + 
                    "OBSERVATION a_d[openEHR-EHR-OBSERVATION.heart_rate-pulse.v1]) " + 
                    "order by a_b/data[at0002]/events[at0003]/time/value asc " +
                    "offset 0 limit 12 ";
				
				narisiGrafa(ehrId, AQL, kraj);
				
			},
			error: function(err) {
				$("#preberiSporocilo").html("<span class='obvestilo label " +
          "label-danger fade-in'>Napaka '" +
          JSON.parse(err.responseText).userMessage + "'!");
			}
		});
	}
}

function narisiGrafa(ehrId, AQL, kraj) {
    if(kraj == "Ni podatka") {
        kraj = undefined;
    }
    
    $.ajax({
	    url: baseUrl + "/query?" + $.param({"aql": AQL}),
	    type: 'GET',
	    headers: {"Ehr-Session": sessionId},
	    success: function (poizvedba) {
	        
	        if(poizvedba) {
	            var podatki = poizvedba.resultSet;
	        }
	        
	        var teze = new Array(podatki.length);
	        var tromesecja = new Array(podatki.length);
	        var sistolicniTlaki = new Array(podatki.length);
	        var diastolicniTlaki = new Array(podatki.length);
	        var datumi = new Array(podatki.length);
	        
	        for(var i=0; i<podatki.length; i++) {
	            teze[i] = podatki[i].weight;
	            if(podatki[i].comment == null) {
	                tromesecja[i] = "Ni podatka o tromesečju."
	            } else {
	                tromesecja[i] = podatki[i].comment;
	            }
	            
	            sistolicniTlaki[i] = podatki[i].systolic;
	            diastolicniTlaki[i] = podatki[i].diastolic;
	            
	            if(i == podatki.length-1) {
	                if((sistolicniTlaki[i] - sistolicniTlaki[0]) >= 30) {
	                    isci = ["hospital"];
	                    
	                    $("#priporocilo").html("<p class='text-center'>Draga nosečka!</p>" + 
	                        "<p class='text-center'>Na podlagi tvojih meritev smo ugotovili, da je tvoj krvni pritisk kar <b>precej povišan</b> glede na tvoj pritisk pred nosečnostjo.</p>" + 
	                        "<p class='text-center'><b>Ne skrbi, zagotovo ni nič resnega.</b></p>" + 
	                        "<p class='text-center'>Vseeno ti priporočamo obisk pri zdravniku, da se prepričaš, da je vse vredu.</p>" + 
	                        "<p class='text-center'>V primeru, da trenutno ne moreš k svojemu osebnemu zdravniku, smo ti na zemljevidu označili <b>zdravstvene ustanove v tvoji okolici</b>, kjer ti bodo z veseljem pomagali.</p>");
	                } else if((sistolicniTlaki[i] - sistolicniTlaki[0]) >= 20) {
	                    isci = ["park"];
	                    $("#priporocilo").html("<p class='text-center'>Draga nosečka!</p>" + 
	                        "<p class='text-center'>Na podlagi tvojih meritev smo ugotovili, da je tvoj krvni pritisk <b>rahlo povišan</b> glede na tvoj pritisk pred nosečnostjo.</p>" + 
	                        "<p class='text-center'>Razlog za to je najverjetneje preveč stresa. Priporočamo ti, da si vzameš malo časa zase.</p>" +
	                        "<p class='text-center'>Na zemljevidu smo ti označili <b>parke v tvoji okolici</b>, kjer lahko preživiš sproščujoče popoldne v družbi svoje najljubše knjige.</p>");
	                } else {
	                    isci = ["spa"];
	                    $("#priporocilo").html("<p class='text-center'>Draga nosečka!</p>" + 
	                        "<p class='text-center'>Na podlagi tvojih meritev smo ugotovili, da je tvoj krvni pritisk popolnoma <b>v mejah normale</b>.</p>" + 
	                        "<p class='text-center'>Na zemljevidu smo ti označili razne <b>wellness in spa centre v tvoji okolici</b>, kjer si lahko privoščiš malce razvajanja.</p>");
	                }
	            }
	            
	            var datum = podatki[i].time;
	            
	            var brezUre = datum.split("T");
	            
	            datumi[i] = brezUre[0];
	        }
	        drawChart(datumi, teze, tromesecja, [], "teze");
	        drawChart(datumi, sistolicniTlaki, diastolicniTlaki, tromesecja, "pritisk");
	        initialize(kraj);
        }
    });
}



function drawChart(tabela1, tabela2, tabela3, tabela4, kateriGraf) {
    
    if(kateriGraf == "teze") {
        var dataTable = new google.visualization.DataTable();
        var datumi = tabela1;
        var teze = tabela2;
        var tromesecja = tabela3;
        
        dataTable.addColumn('string', 'Datum');
        dataTable.addColumn('number', "Teža");
        dataTable.addColumn({type: 'string', role: 'tooltip'});
        
        if(teze.length > 0) {
            for(var j=0; j<teze.length; j++) {
                var tab = new Array(3);
                if(j == 0) {
                    var detail = tromesecja[j] + "\nDatum: " + datumi[j] + "\nTeža: " + teze[j] + " kg";
                } else {
                    var detail = tromesecja[j] + "\nDatum: " + datumi[j] + "\nTeža: " + teze[j] + " kg" + "\nSprememba teže (od začetka nosečnosti): " + (teze[j] - teze[0]).toFixed(2) + " kg";
                }
                tab[0] = datumi[j];
                tab[1] = teze[j];
                tab[2] = detail;
                
                dataTable.addRow(tab);
            }
        } else {
             dataTable.addRows([['Ni podatkov za prikaz', { role: 'annotation' }, { role: 'annotation' }],]);
        }
        
    
        var options = {
          title: 'Tvoja teža skozi nosečnost',
          curveType: 'function',
          legend: { position: 'bottom' },
          pointSize: 13,
          pointShape: { type: 'star', sides: 5, dent: 0.5 }
        };
        
        var chart = new google.visualization.LineChart($("#grafTeze")[0]);
    } else {
        var dataTable = new google.visualization.DataTable();
        var datumi = tabela1;
        var sistolicniTlaki = tabela2;
        var diastolicniTlaki = tabela3;
        var tromesecja = tabela4;
        
        dataTable.addColumn('string', 'Datum');
        dataTable.addColumn('number', "Sistolični tlak");
        dataTable.addColumn({type: 'string', role: 'tooltip'});
        dataTable.addColumn('number', "Diastolični tlak");
        dataTable.addColumn({type: 'string', role: 'tooltip'});
        
        if(datumi.length > 0) {
            for(var j=0; j<datumi.length; j++) {
                var tab = new Array(5);
                tab[0] = datumi[j];
                tab[1] = sistolicniTlaki[j];
                tab[2] = tromesecja[j] + "\nDatum: " + datumi[j] + "\nSistolični pritisk: " + sistolicniTlaki[j].toFixed(0) + "\nDiastolični pritisk: " + diastolicniTlaki[j].toFixed(0);
                tab[3] = diastolicniTlaki[j];
                tab[4] = tromesecja[j] + "\nDatum: " + datumi[j] + "\nSistolični pritisk: " + sistolicniTlaki[j] + "\nDiastolični pritisk: " + diastolicniTlaki[j];
                
                dataTable.addRow(tab);
            }
        } else {
            dataTable.addRows([['Ni podatkov za prikaz', { role: 'annotation' }, { role: 'annotation' }, { role: 'annotation' }, { role: 'annotation' }],]);
        }
        
        var options = {
          title: 'Tvoj pritisk skozi nosečnost',
          curveType: 'function',
          legend: { position: 'bottom' },
          pointSize: 13,
          pointShape: { type: 'star', sides: 5, dent: 0.5 },
          colors: [ '#703593', '#ff1493' ]
        };
        var chart = new google.visualization.LineChart($("#grafPritiska")[0]);
    }
    chart.draw(dataTable, options);
}

google.maps.event.addDomListener(window, 'load', function() {
    initialize(undefined);
});

function initialize(mesto) {
    if(mesto == undefined) {
        var kraj = "Ljubljana";
    } else {
        var kraj = mesto;
    }
    
    var geocoder = new google.maps.Geocoder();
    
    geocoder.geocode( {'address' : kraj}, geocodeCallback);
}

var map;
var infowindow = new google.maps.InfoWindow();

function geocodeCallback(results, status) {
    console.log(" status " + status);
    if (status != google.maps.GeocoderStatus.OK) {
    console.log(" statusq " + status);
        return;
    }
    
    var   sirina = results[0].geometry.location.lat();
    var   dolzina = results[0].geometry.location.lng();
    
    console.log(sirina + " in " + dolzina);
    var city = new google.maps.LatLng(sirina, dolzina);
    
    var mapProp = {
      center: city,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    map = new google.maps.Map($("#googleMap")[0], mapProp);
    
    var request = {
        location: city,
        radius: 5000,
        types: isci //kaj naj oznaci na zemljevidu
    };
    
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}




$(document).ready(function() {
    
    $("#generiraj").click(function() {
        $("#kreirajSporocilo").html("");
        $("#podatkiONosecki").html("");
        generirajPodatke(1);
        generirajPodatke(2);
        generirajPodatke(3);
    });
    
    $("#dodajMeritveVitZnakov").click(function() {
        preberiEHR();
    })
    
    $("#preberiObstojeciEHR").on('change',function(){
        var vrednost = $(this).val(); // vrednost 
        $("#preberiEHRid").val(vrednost);
        
    });
});
