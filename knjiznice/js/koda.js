
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(function() {
    drawChart([], [], [], "teze");
    drawChart([], [], [], "pritisk");
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
      var datumRojstva = "1854-03-12T00:00:00.000Z";
      var naslov = "Bled";
      
      var meritve = {
        datumMeritve: ["2015-10-11T21:41:14.255+02:00", "2015-12-06T21:41:14.255+02:00", "2016-01-31T21:41:14.255+02:00", "2016-04-15T21:41:14.255+02:00"],
        visina: [167, 167, 167, 167],
        teza: [57.00, 57.20, 58.50, 61.50],
        tromesecje: ["Pred nosečnostjo", "1. tromesečje", "1. tromesečje", "2. tromesečje"],
        sistolicniTlak: [115, 120, 117, 115], //v mejah normale
        diastolicniTlak: [70, 75, 70, 73]
      }
  } else if(stPacienta == 2) {
      var ime = "Pepelka";
      var priimek = "Pepelnata";
      var datumRojstva = "1697-06-08T00:00:00.000Z";
      var naslov = "Ljubljana";
      
      var meritve = {
        datumMeritve: ["2015-08-11T21:41:14.255+02:00", "2015-10-06T21:41:14.255+02:00", "2015-11-20T21:41:14.255+02:00", "2016-01-15T21:41:14.255+02:00",
            "2016-03-17T21:41:14.255+02:00", "2016-05-05T21:41:14.255+02:00"],
        visina: [165, 165, 165, 165, 165, 165],
        teza: [55.00, 55.00, 56.70, 61.50, 63.80, 65.30],
        tromesecje: ["Pred nosečnostjo", "1. tromesečje", "1. tromesečje", "2. tromesečje", "2. tromesečje", "3. tromesečje"],
        sistolicniTlak: [95, 98, 96, 100, 96, 115], //rahlo povisan
        diastolicniTlak: [63, 65, 63, 69, 68, 80]
      }
  } else if(stPacienta == 3) {
      var ime = "Aurora";
      var priimek = "Zaspana";
      var datumRojstva = "1697-10-21T00:00:00.000Z";
      var naslov = "Maribor";
      
      var meritve = {
        datumMeritve: ["2016-01-31T21:41:14.255+02:00", "2016-03-15T21:41:14.255+02:00", "2016-04-05T21:41:14.255+02:00"],
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
		                    $("#kreirajSporocilo").html("<span class='obvestilo " +
                          "label label-success fade-in'>Uspešno kreiran EHR '" +
                          ehrId + "'.</span>");
		                    $("#preberiEHRid").val(ehrId);
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
    
    var ehrId = $("#preberiObstojeciEHR").val();
    var izbranoTromesecje = $("input[name='izberiTromesecje']:checked").val();
    
    var datum = $("#dodajVitalnoDatum").val();
    var visina = $("#dodajVitalnoTelesnaVisina").val();
    var teza = $("#dodajVitalnoTelesnaTeza").val();
    var sistolicniTlak = $("#dodajVitalnoKrvniTlakSistolicni").val();
    var diastolicniTlak = $("#dodajVitalnoKrvniTlakDiastolicni").val();
    
    
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
    
    console.log(ehrId);
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
		}

		//console.log(meritve.teza[index]);
		
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
		
		console.log(poizvedba.responseText);
		
		
}

function preberiEHRodBolnika() {
	sessionId = getSessionId();

	var ehrId = $("#preberiEHRid").val();

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
				
				var datumRojstva = party.dateOfBirth.split("T");
				
				$("#podatkiONosecki").html("<p class='text-left'>Ime in priimek: " + party.firstNames + " " + party.lastNames + "</p>" +
				"<p class='text-left'>Datum rojstva: " + datumRojstva[0] + "</p>" +
				"<p class='text-left'>Kraj bivanja: " + party.address.address + "</p>");
				
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
                    "offset 0 limit 100 ";
				
				//console.log(AQL);
				narisiGrafa(ehrId, AQL);
				
				/*$("#preberiSporocilo").html("<span class='obvestilo label " +
                "label-success fade-in'>Bolnik '" + party.firstNames + " " +
                party.lastNames + "', ki se je rodil '" + party.dateOfBirth +
                "'.</span>");*/
			},
			error: function(err) {
				$("#preberiSporocilo").html("<span class='obvestilo label " +
          "label-danger fade-in'>Napaka '" +
          JSON.parse(err.responseText).userMessage + "'!");
			}
		});
	}
}

function narisiGrafa(ehrId, AQL) {
    $.ajax({
	    url: baseUrl + "/query?" + $.param({"aql": AQL}),
	    type: 'GET',
	    headers: {"Ehr-Session": sessionId},
	    success: function (poizvedba) {
	        
	        //console.log(poizvedba.resultSet);
	        
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
	            tromesecja[i] = podatki[i].comment;
	            sistolicniTlaki[i] = podatki[i].systolic;
	            diastolicniTlaki[i] = podatki[i].diastolic;
	            
	            var datum = podatki[i].time;
	            
	            //console.log(datum.value);
	            var brezUre = datum.split("T");
	            
	            datumi[i] = brezUre[0];
	        }
	        
	        console.log(diastolicniTlaki);
	        
	        drawChart(datumi, teze, tromesecja, "teze");
	        drawChart(datumi, sistolicniTlaki, diastolicniTlaki, "pritisk");
	        
	        
        }
    });
}



function drawChart(tabela1, tabela2, tabela3, kateriGraf) {
    
    //console.log(datumi);
    if(kateriGraf == "teze") {
        var dataTable = new google.visualization.DataTable();
        var datumi = tabela1;
        var teze = tabela2;
        
        dataTable.addColumn('string', 'Datum');
        dataTable.addColumn('number', "Teža");
        
        if(teze.length > 0) {
            for(var j=0; j<teze.length; j++) {
                var tab = new Array(2);
                tab[0] = datumi[j];
                tab[1] = teze[j];
                
                dataTable.addRow(tab);
            }
        } else {
            dataTable.addRows([['Ni podatkov za prikaz', { role: 'annotation' }],]);
        }
    
        var options = {
          title: 'Tvoja teža skozi nosečnost',
          curveType: 'function',
          legend: { position: 'bottom' }
        };
        
        var chart = new google.visualization.LineChart($("#grafTeze")[0]);
    } else {
        var dataTable = new google.visualization.DataTable();
        var datumi = tabela1;
        var sistolicniTlaki = tabela2;
        var diastolicniTlaki = tabela3;
        
        dataTable.addColumn('string', 'Datum');
        dataTable.addColumn('number', "Sistolični tlak");
        dataTable.addColumn('number', "Diastolični tlak");
        
        if(datumi.length > 0) {
            for(var j=0; j<datumi.length; j++) {
                var tab = new Array(3);
                tab[0] = datumi[j];
                tab[1] = sistolicniTlaki[j];
                tab[2] = diastolicniTlaki[j];
                
                dataTable.addRow(tab);
            }
        } else {
            dataTable.addRows([['Ni podatkov za prikaz', { role: 'annotation' }, { role: 'annotation' }],]);
        }
        
        var options = {
          title: 'Tvoj pritisk skozi nosečnost',
          curveType: 'function',
          legend: { position: 'bottom' }
        };
        var chart = new google.visualization.LineChart($("#grafPritiska")[0]);
    }
    chart.draw(dataTable, options);
}


/*function initialize() {
    /*var city;
    var geocoder = new google.maps.Geocoder();
    
    geocoder.geocode( {'address' : city}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
        }
    });
    
    var mapProp = {
      center:new google.maps.LatLng(51.508742, -0.120850),
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    var map = new google.maps.Map($("#googleMap"), mapProp);
}*/


$(document).ready(function() {
    
    $("#generiraj").click(function() {
        generirajPodatke(1);
    });
    
    $("#preberiObstojeciEHR").on('change',function(){
        var vrednost = $(this).val(); // vrednost 
        $("#preberiEHRid").val(vrednost);
        
        //google.maps.event.addDomListener(window, 'load', initialize);
    });
    
    
});


// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija
