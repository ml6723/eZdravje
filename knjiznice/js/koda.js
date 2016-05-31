
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
      
      var visina = [167, 167, 167, 167];
      var teza = [57.00, 57.20, 58.50, 61.50];
      var tromesecje = ["Pred nosečnostjo", "1. tromesečje", "1. tromesečje", "2. tromesečje"];
      var sistolicniTlak = [115, 120, 117, 115];
      var diastolicniTlak = [70, 75, 70, 73];
  } else if(stPacienta == 2) {
      var ime = "Pepelka";
      var priimek = "Pepelnata";
      var datumRojstva = "1697-06-08T00:00:00.000Z";
      var naslov = "Ljubljana";
      
      var visina = [165, 165, 165, 165, 165, 165];
      var teza = [55.00, 55.00, 56.70, 61.50, 63.80, 65.30];
      var tromesecje = ["Pred nosečnostjo", "1. tromesečje", "1. tromesečje", "2. tromesečje", "2. tromesečje", "3. tromesečje"];
      var sistolicniTlak = [95, 98, 96, 100, 96, 115];
      var diastolicniTlak = [63, 65, 63, 69, 68, 80];
  } else if(stPacienta == 3) {
      var ime = "Aurora";
      var priimek = "Zaspana";
      var datumRojstva = "1697-10-21T00:00:00.000Z";
      var naslov = "Maribor";
      
      var visina = [163, 163, 163];
      var teza = [50.30, 50.60, 51.60];
      var tromesecje = ["Pred nosečnostjo", "1. tromesečje", "1. tromesečje"];
      var sistolicniTlak = [108, 112, 144];
      var diastolicniTlak = [71, 72, 91];
  }

  /*$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
    
    */
  return ehrId;
}


// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija
