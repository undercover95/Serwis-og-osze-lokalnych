function showMyImage(fileInput) 
{
    var files = fileInput.files;
    for (var i = 0; i < files.length; i++) {           
        var file = files[i];
        var imageType = /image.*/;     
        if (!file.type.match(imageType)) {
            continue;
        }
                
        var imgDiv=document.getElementsByClassName("miniaturka")[i];
        if(i == 0)
        {
            $(imgDiv).addClass('glowne');
        }
        var img = imgDiv.firstChild;    
        img.file = file;    
        var reader = new FileReader();
        reader.onload = (function(aImg) { 
            return function(e) { 
                aImg.src = e.target.result; 
            }; 
        })(img);
        reader.readAsDataURL(file);
        
    }    
}


$('#dodaj-ogloszenie-form').on('submit', function(e) 
{
    e.preventDefault();

    // walidacja danych
    var dane = $(this).serializeArray();
    /*for(var i = 0; i < dane.length; i++)
        switch(i)
        {
            case(0): // Tytul ogloszenia
            
            case(2): // opis
            case(4): // cena
        }*/
    console.log("*********************************");
    var formData = new FormData($(this)[0]);
    console.log(formData);
    //formData.append('file', $('#file')[0].files[0]);
    //console.log($(this).serialize());
    console.log("*********************************");
    

    // wyślij dane
    $.ajax({
        type     : "POST",
        url      : "/dodaj_ogloszenie",
        data     : formData,
        processData: false,  // Important!
        enctype: 'multipart/form-data',
        contentType: false,
        cache: false,
        success: function(ret) {
            document.write(ret);
        },
        error: function(jqXHR, errorText, errorThrown) {
            console.log('err');
            if(jqXHR.status == 401)
                $('.powiadomienie').html('<div role="alert" style="margin-top: 10px;" class="alert alert-warning"><span class="glyphicon glyphicon-exclamation-sign"></span> Aby wykonać tą czynność musisz być zalogowany. <a href="/zaloguj" class="alert-link"> Zaloguj się.</a></div>');
            else
            $('.powiadomienie').html('<div role="alert" style="margin-top: 10px;" class="alert alert-danger"><span class="glyphicon glyphicon-exclamation-sign"></span> Wystąpił błąd podczas dodawania formularza. Spróbuj ponownie później.</div>');
    }
    });

});

function sort(select)
{
    console.log("sort "+select.value);   
    $.ajax({
        type     : "POST",
        url      : "/lista_ogloszen",
        data     : {'sortuj_opcja': select.value},
        beforeSend: function() {
            $('#lista-ogloszen').empty();
        },
        success: function(ret) {
            $('#lista-ogloszen').html(ret);
        },
        error: function(jqXHR, errorText, errorThrown) {
            console.log(errorThrown);
        }
    });
}









$(document).ready(function(){

    $('textarea').keyup(updateCount);
    $('textarea').keydown(updateCount);

    function updateCount() {
        var cs = $(this).val().length;
        if(240 < cs && cs <= 250)
            $('#charCounter').css('color', 'red');
        else $('#charCounter').css('color', 'black');
        $('#charCounter').html('<p>Ilość znaków: '+cs+'/250</p>');
    }




    var loading = $('#loader-wrapper').hide();
    $(document).ajaxStart(function () {
        loading.show();
    })
    .ajaxStop(function () {
        loading.hide();
    });

});