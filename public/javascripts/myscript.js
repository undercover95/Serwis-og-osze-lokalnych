function dialogYesNo(title, content, confirmText, declineText, callback){

        $.confirm({
        animation: 'zoom',
        closeAnimation: 'scale',
        title: title,
        content: content,
        buttons: {
            ok: {
                text: confirmText,
                btnClass: 'btn btn-primary',
                keys: ['enter'],
                action: function(){
                    callback("ok");
                }
            },
            anuluj: {
                text: declineText,
                btnClass: 'btn btn-default',
                keys: ['esc'],
                action: function(){
                    callback("anuluj");
                }
            }
        }
    });
}


function obslugaPrzyciskowOgloszeniaUserPanel(opcja, id, ramka){
    // obsluga przyciskow ogloszenia w userpanel
    //console.log(opcja);
    //console.log(id);

    var ajaxRequest = function(){
        $.ajax({
            type     : "post",
            url      : "/mojeogloszenia?option="+opcja+"&advert_id="+id,
            contentType: false,
            cache: false,
            success: function(ret) {
                if(ret === 'ref')
                {
                    $.alert({
                        title: 'Odświeżanie ogłoszenia',
                        content: 'Wybrane ogłoszenie zostało odświeżone.'
                    });
                }
                    
                else if(ret === 'remove')
                {
                    var ramkaParent = $(ramka).closest('.userpanel-ogloszenie');
                    var liczbaOgloszenKontrolki = document.getElementsByClassName('liczba-ogloszen');
              
                    for(var i = 0; i < liczbaOgloszenKontrolki.length; i++)
                    {
                        var staraWartosc = parseInt(liczbaOgloszenKontrolki[i].innerHTML);
                        $(liczbaOgloszenKontrolki[i]).html(staraWartosc-1);                   
                    }
     
                    $(ramkaParent).fadeOut('slow', function(){
                        $(ramkaParent).remove();
                    });

                    $.alert({
                        title: 'Usuwanie ogłoszenia',
                        content: 'Wybrane ogłoszenie zostało usunięte.'
                    });
                }
            },
            error: function(jqXHR, errorText, errorThrown) {
                $.alert({
                        title: 'Błąd operacji',
                        content: 'Wystąpił błąd podczas operacji. Spróbuj ponownie później.'
                });
            }
        });
    }
    
    if(opcja === 'remove')
    {
        dialogYesNo('Usuwanie ogłoszenia', 'Czy na pewno chcesz usunąć to ogłoszenie?', 'Potwierdź', 'Anuluj', function(chosen){
            if(chosen !== 'anuluj'){
                // wyślij dane
                ajaxRequest();
            }
        });
    }
    else if(opcja === 'ref')
    {
        ajaxRequest();
    }

}

$(document).ready(function(){
	
				
		// CSSMap;
		$("#map-poland").CSSMap({
			"size": 430
		});

    var checkBrowserDndUploadSupport = function()
    {
        var div = document.createElement('div');
        return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
    }

    var $dndinputDiv = $('.drag-n-drop-box-input');
    if(checkBrowserDndUploadSupport)
    {
        $dndinputDiv.addClass('browserSupportsDnd');


        var droppedFiles = [];

        var $input = $('.drag-n-drop-box-input input');

        $('#dodaj-ogloszenie-form').on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
        })
        .on('dragover dragenter', function(){
             $dndinputDiv.addClass('isDragover');
        })
        .on('dragleave dragend drop', function(){
             $dndinputDiv.removeClass('isDragover');
        })
        .on('drop', function(e){

            for(var j=0; j<e.originalEvent.dataTransfer.files.length; j++)
                droppedFiles.push(e.originalEvent.dataTransfer.files[j]);
            
            console.log("DROPPED "+droppedFiles.length+" FILES!");
            for(var i=0; i<droppedFiles.length; i++){
                var file = droppedFiles[i];
                if (file.type.match('image.*'))
                    continue;
                else {
                    droppedFiles = [];
                    $.alert({
                            title: 'Nieprawidłowy plik.',
                            content: '<strong>Plik: "'+ file.name +'" jest nieprawidłowy.</strong><br/>Możesz wysłać tylko pliki będące plikami graficznymi.'
                        });
                    return;
                }
            }
            //console.log(droppedFiles);
            showFiles(droppedFiles);
        });


        $label = $('#dodaj-ogloszenie-form').find('.drag-n-drop-label');
        var showFiles = function(files) {
            //$('#zdj-glowne').hide();

            if(files.length < 1) $label.text('Nie wybrano plików');
            else if(files.length == 1) $label.text(files[0].name);
            else if(files.length > 1) $label.text($input.attr('data-multiple-caption').replace('{count}', files.length));

            for (var i = 0; i < files.length; i++) {
                console.log('i: '+i);           
                var file = files[i];
                
                // get div wrapper
                var imgDiv = document.getElementsByClassName("miniaturka")[i];
                $(imgDiv).show();
                
                var img = imgDiv.firstChild;    

                var reader = new FileReader();
                reader.onload = (function(image) {
                    return function(e){
                        $(image).attr('src', e.target.result);
                    }
                })(img);

                reader.readAsDataURL(file);

            } 
        };

        $input.on('change', function(e) {
            droppedFiles = [];
            for(var j=0; j<e.target.files.length; j++)
                droppedFiles.push(e.target.files[j]);
            showFiles(e.target.files);
        });

        $('.remove-img').on('click', function(e){
            e.preventDefault();
            console.log("remove clicked");

            var imgToRemove = $(this).parent().children('.miniaturka-img')[0];
            //console.log(imgToRemove);
            var imgIndex = imgToRemove.dataset.index;
            console.log("index: "+imgIndex);
            console.log("dlugosc droppedFiles przed: "+droppedFiles.length);

            var ostatniaPustaMiniaturka = $('.miniaturka')[droppedFiles.length-1];
            console.log(ostatniaPustaMiniaturka);
            $(ostatniaPustaMiniaturka).hide();
            //$(imgToRemove).attr('src', '');

            droppedFiles.splice(imgIndex,1);
            console.log(droppedFiles.length);
            console.log("dlugosc droppedFiles po: "+droppedFiles.length);

            showFiles(droppedFiles);

        });

        $('#dodaj-ogloszenie-form').on('submit', function(e){
            e.preventDefault();

            var dane = new FormData($(this).get(0));

            if(droppedFiles.length !== 0){
                $.each( droppedFiles, function(i, file) {
                    dane.append( $input.attr('name'), file );
                });
            }
            else return;

            // wyślij dane
            $.ajax({
                type     : "POST",
                url      : "/dodaj_ogloszenie",
                data     : dane,
                processData: false,  // Important!
                enctype: 'multipart/form-data',
                contentType: false,
                cache: false,
                success: function(ret) {
                    document.write(ret);
                },
                error: function(jqXHR, errorText, errorThrown) {
                    console.log('err');
                    if(jqXHR.status == 401){
                        $.alert({
                            title: 'Nie jesteś zalogowany!',
                            content: 'Aby wykonać tą czynność musisz być zalogowany. <a href="/zaloguj" class="alert-link"> Zaloguj się.</a>'
                        });
                    }
                    else{
                        $.alert({
                            title: 'Błąd podczas dodawania ogłoszenia',
                            content: 'Wystąpił błąd podczas dodawania ogłoszenia. Spróbuj ponownie później.'
                        });
                    }
                }
            });
        });
    }

    // Obsluga formularza rejestracji
    var $avatarInput = $('#rejestracja-form').find('input[id="awatar"]');
    var avatarImage = null;

    $($avatarInput).on('change', function(e){
        if(this.files.length > 1) {
            $.alert({
                title: 'Błąd podczas rejestracji',
                content: 'Można przesłać tylko <strong>jedno</strong> zdjęcie użytkownika.'
            });
        }
        else avatarImage = this.files[0];

        var showAvatarPreview = function(file)
        {
            $label = $('#rejestracja-form').find('#awatar-label');
            $label.text($($avatarInput).attr('data-multiple-caption').replace( '{count}', '1'));

            // get div wrapper
            var imgDiv = document.getElementsByClassName("awatar-preview")[0];
            $(imgDiv).css('display', 'inline-block');
            
            var img = imgDiv.firstChild;    

            var reader = new FileReader();
            reader.onload = (function(image) {
                return function(e){
                    $(image).attr('src', e.target.result);
                }
            })(img);

            reader.readAsDataURL(file);
        }
        showAvatarPreview(avatarImage);
    }); 

    $('#rejestracja-form').on('submit', function(e){
        e.preventDefault();

        var dane = new FormData($(this).get(0)); 
        dane.append( $avatarInput.attr('name'), avatarImage );

        console.log(avatarImage);
        // NIE PRZESYLA PLIKU - POOPRAWIC
        $.ajax({
            type     : "POST",
            url      : "/zarejestruj",
            data     : dane,
            processData: false,  // Important!
            enctype: 'multipart/form-data',
            contentType: false,
            cache: false,
            success: function(ret) {
                document.write(ret);
            },
            error: function(jqXHR, errorText, errorThrown) {

                $.alert({
                    title: 'Błąd podczas rejestracji.',
                    content: 'Wystąpił błąd podczas procesu rejestracji. Spróbuj ponownie później.'
                });
                
            }
        }); 
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