
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


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
		 
		 //dodaj meritve
        
    
  return ehrId;
}

function dodajMeritveVitalnihZnakov() {
    sessionId = getSessionId();
    
    var meritve = {
        visina: $("#dodajVitalnoTelesnaVisina").val(),
        teza: $("#dodajVitalnoTelesnaTeza").val(),
        sistolicniTlak: $("#dodajVitalnoKrvniTlakSistolicni").val(),
        diastolicniTlak: $("#dodajVitalnoKrvniTlakDiastolicni").val(),
        tromesecje: $("#izberiTromesecje").val()
    }
    
    //pridobi ehrID iz izbrane nosečke
    
    dodajMeritve(ehrId, meritve, -1);
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
    		    "ctx/time": "1854-03-12T00:00:00.000Z",
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
    		    "ctx/time": "1854-03-12T00:00:00.000Z",
    		    "vital_signs/height_length/any_event/body_height_length": meritve.visina[index],
    		    "vital_signs/body_weight/any_event/body_weight": meritve.teza[index],
    		    "vital_signs/pulse/any_event/comment": meritve.tromesecje[index],
    		    "vital_signs/blood_pressure/any_event/systolic": meritve.sistolicniTlak[index],
    		    "vital_signs/blood_pressure/any_event/diastolic": meritve.diastolicniTlak[index]
    		};
		}

		console.log(meritve.teza[index]);
		
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

$(document).ready(function() {
    
    $("#generiraj").click(function() {
        generirajPodatke(1);
    });
});


// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija
