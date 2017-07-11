var express = require('express');
var router = express.Router();

var mysql = require('mysql')
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1995',
  database: 'ogloszenia'
});

var fs = require('fs');
var multer = require('multer');
var mime = require('mime');
var session = require('express-session');
var dateFormat = require('dateformat');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var d = new Date();
          var path = './uploads/'+d.getFullYear()+'/'+d.getMonth()+'/';
          
          if(!fs.existsSync('./uploads/'+d.getFullYear()))
              fs.mkdirSync('./uploads/'+d.getFullYear());
          
          else if(!fs.existsSync('./uploads/'+d.getFullYear() +'/' + d.getMonth()))
              fs.mkdirSync('./uploads/'+d.getFullYear() +'/' + d.getMonth());
  
        cb(null, path)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now().toString() + '.' + mime.extension(file.mimetype));
  }
})

var upload = multer({storage: storage}).array('photo',3); // limit do 3 zdjec

var session;


var kategorie = null;
connection.connect();

function odswiezKategorie()
{
    connection.query('select *,(select count(*) from Ogloszenia where Kategoria_ID=Kategorie.ID) as liczba from Kategorie', function (err, rows, fields) 
    {
        if (err) throw err;
        else kategorie = rows;
    });
}
odswiezKategorie();

router.get('/test', function(req, res) {
    req.flash('info', 'informacja');
    res.redirect('/');
});

/* GET home page. */
router.get('/', function(req, res) {
    console.log(kategorie);
    session = req.session;
    connection.query('select *,UNIX_TIMESTAMP() - UNIX_TIMESTAMP(Data_dodania) as czas from Ogloszenia order by Ogloszenia.Data_dodania desc limit 5', function (err, rows, fields) 
    {
        if (err) throw err;
        else res.render('index', { title: 'Serwis ogłoszeń lokalnych', kategorie: kategorie, ogloszenia: rows, uzytkownik: session.username });
    });
});

/* GET dodaj ogloszenie  */
router.get('/dodaj_ogloszenie', function(req, res) {
  
        res.render('dodaj_ogloszenie', { title: 'Dodawanie ogłoszenia - Serwis ogłoszeń lokalnych', kategorie: kategorie, uzytkownik: session.username, powiadomienie: req.flash('loggedOutErr')});
});



/* POST dodaj ogloszenie */
router.post('/dodaj_ogloszenie', function(req, res) 
{
    
    upload(req,res,function(err) 
    {
        var tytul = req.body.tytul; // body-parser nie wspiera multipart form data
        var kategoria = req.body.kategoria;
        var opis = req.body.opis;
        var lokalizacja = req.body.lokalizacja;
        var cena = req.body.cena;

        if(session.username)
        {
            connection.query('select ID from Uzytkownicy where Nazwa="'+session.username+'"', function (err, rows) 
            {
                if (err) throw err;
                else
                {
                    var user_id = rows[0]['ID'];
                    connection.query('select ID from Kategorie where Nazwa="'+kategoria+'"', function (err, rows, fields1) 
                    {
                        if (err) throw err;
                        else 
                        {
                            var cat_id = rows[0]['ID'];
                            connection.query('insert into Ogloszenia values(default,"'+tytul+'",'+cat_id+',"'+opis+'","'+lokalizacja+'",'+cena+',default,'+user_id+',default,default)', function (err, rows, fields2) 
                            {
                                if (err) throw err;
                                else 
                                {
                                    odswiezKategorie();
                                    connection.query('select LAST_INSERT_ID()', function (err, rows, fields3)
                                    {
                                        var last_advert_id = rows[0]['LAST_INSERT_ID()'];
                                        
                                        if (err) throw err;
                                        else
                                        {
                                            console.log("dlugosc zdjec: "+req.files.length);
                                            if(req.files.length != 0)
                                            {
                                                console.log("sa zdjecia" + req.files);
                                                
                                                for(var i=0; i < req.files.length; i++) 
                                                {
                                                    var file = req.files[i];
                                                    var path = file.path.toString();
                                                    path = path.replace(/\\/g, '/'); // zamien backslash na slash (mysql ma z tym problem)

                                                    connection.query('insert into Zdjecia_ogloszen values('+last_advert_id+', default,"'+path+'")', function (err, rows, fields4)
                                                    {
                                                        if (err) throw err;
                                                    });
                                                }

                                                // pobieram zdjecie glowne (pierwsze id)
                                                connection.query('select Sciezka from Zdjecia_ogloszen where ID_ogloszenia='+last_advert_id+' limit 1', function (err, rows, fields5)
                                                {
                                                    var zdjecie_glowne_sciezka = rows[0]['Sciezka'];
                                                    if (err) throw err;
                                                    else
                                                    {
                                                        // ustawiam zdjecie glowne
                                                        connection.query('update Ogloszenia set Zdjecie_glowne="'+zdjecie_glowne_sciezka+'" where ID='+last_advert_id, function (err, rows, fields6)
                                                        {

                                                            if (err) throw err;
                                                            else res.render('dodano_ogloszenie', {title: 'Pomyślnie dodano nowe ogłoszenie - Serwis ogłoszeń lokalnych', uzytkownik: session.username});
                                                        });
                                                    }
                                                });
                                            }
                                            else {
                                                console.log("nie ma zdjec");
                                                res.render('dodano_ogloszenie', {title: 'Pomyślnie dodano nowe ogłoszenie - Serwis ogłoszeń lokalnych', uzytkownik: session.username});
                                            }                          
                                        }                      
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
        else
        {
            console.log("niezalogowany");
            res.send(401);
        }
    });
});













/* GET add advert page  */
router.get('/zobacz_ogloszenie', function(req, res) 
{
   var ogl_id = req.query.ogloszenie_id;
   connection.query('select Ogloszenia.*,Uzytkownicy.Nazwa, Uzytkownicy.Tel, Uzytkownicy.Mail from Ogloszenia join Uzytkownicy on Ogloszenia.Uzytkownik_ID=Uzytkownicy.ID where Ogloszenia.ID='+ogl_id, function (err, rows, fields) 
    {
        var dane_ogloszenia = rows;
        if (err) throw err;
        else
        {
          connection.query('select Sciezka from Zdjecia_ogloszen where ID_ogloszenia='+ogl_id, function (err, rows, fields) 
          {
            var zdjecia = rows;
            if (err) throw err;
            else 
            {
                connection.query('select * from Kategorie where ID='+ dane_ogloszenia[0]['Kategoria_ID'], function (err, rows, fields) 
                {
                    if (err) throw err;
                    else 
                    {
                        res.render('zobacz_ogloszenie', { title: 'Przeglądanie ogłoszenia - Serwis ogłoszeń lokalnych', kategorie: kategorie, ogloszenie: dane_ogloszenia, zdjecia: zdjecia, kategoria: rows[0], uzytkownik: session.username});  
                    }
                });
            }
          });
        }  
    }); 
});

/* GET add advert page  */
router.get('/lista_ogloszen', function(req, res) {
    var id = req.query.cat_id;
    connection.query('select *,UNIX_TIMESTAMP() - UNIX_TIMESTAMP(Data_dodania) as czas from Ogloszenia where Kategoria_ID='+id+' order by Ogloszenia.Data_dodania desc', function (err, rows, fields) 
    {
        if (err) throw err;
        else 
        {
            res.render('lista_ogloszen', { title: 'Lista ogłoszeń - Serwis ogłoszeń lokalnych', subtitle: 'Lista ogłoszeń', kategorie: kategorie, ogloszenia: rows, uzytkownik: session.username});
        }
    });
});

router.post('/zobacz_ogloszenie', function(req, res) {
    var ogl_id = req.query.ogloszenie_id;
    connection.query('UPDATE Ogloszenia SET Priorytet=CURRENT_TIMESTAMP where ID='+ogl_id, function (err, rows, fields) 
    {
        if (err) throw err;
        else res.render('lista_ogloszen', { title: 'Lista ogłoszeń - Serwis ogłoszeń lokalnych', kategorie: kategorie, ogloszenia: rows, uzytkownik: session.username});
    });
});

router.post('/lista_ogloszen', function(req, res) {

	// obsluga sortowania
	if(req.body.sortuj_opcja != undefined)
	{
            var catId = 1; // TODO: poprawic pobieranie cat id z url

            if(req.body.sortuj_opcja === 'Od najtańszych')
            {
                connection.query('select *, UNIX_TIMESTAMP() - UNIX_TIMESTAMP(Data_dodania) as czas from Ogloszenia where Kategoria_ID='+catId+' order by Ogloszenia.Cena', function (err, rows, fields) 
                {
                    if (err) throw err;
                    else 
                    {
                        res.render('lista_ogloszen_main', {ogloszenia: rows});
                    }
                });
            }

            else if(req.body.sortuj_opcja === 'Od najdroższych')
            {
                connection.query('select *, UNIX_TIMESTAMP() - UNIX_TIMESTAMP(Data_dodania) as czas from Ogloszenia where Kategoria_ID='+catId+' order by Ogloszenia.Cena desc', function (err, rows, fields) 
                {
                    if (err) throw err;
                    else 
                    {
                        res.render('lista_ogloszen_main', {ogloszenia: rows});
                    }
                });
            }

            else if(req.body.sortuj_opcja === 'Od najstarszych')
            {
                connection.query('select *, UNIX_TIMESTAMP() - UNIX_TIMESTAMP(Data_dodania) as czas from Ogloszenia where Kategoria_ID='+catId+' order by Ogloszenia.Data_dodania', function (err, rows, fields) 
                {
                    if (err) throw err;
                    else 
                    {
                        res.render('lista_ogloszen_main', {ogloszenia: rows});
                    }
                });
            }

            else if(req.body.sortuj_opcja === 'Od najnowszych')
            {
                connection.query('select *, UNIX_TIMESTAMP() - UNIX_TIMESTAMP(Data_dodania) as czas from Ogloszenia where Kategoria_ID='+catId+' order by Ogloszenia.Data_dodania desc', function (err, rows, fields) 
                {
                    if (err) throw err;
                    else 
                    {
                        res.render('lista_ogloszen_main', {ogloszenia: rows});
                    }
                });
            }
	}
	
    else if(req.body.expr != undefined || req.body.expr !== '')
    {
        // obsluga szukajki
        var expr = req.body.expr;
        connection.query('select *, UNIX_TIMESTAMP() - UNIX_TIMESTAMP(Data_dodania) as czas from Ogloszenia where Tytul like "%'+ expr +'%"', function (err, rows, fields) 
        {
            if (err) throw err;
            else res.render('lista_ogloszen', { title: 'Lista ogłoszeń - Serwis ogłoszeń lokalnych', subtitle: 'Lista ogłoszeń dla: "'+expr+'"', kategorie: kategorie, ogloszenia: rows, uzytkownik: session.username });
        });
    }
});

router.post('/', function(req, res) {
    var expr = req.body.expr;
    connection.query('select * from Ogloszenia where Tytul like "%'+ expr +'%"', function (err, rows, fields) 
    {
        if (err) throw err;
        else res.render('lista_ogloszen', { title: 'Lista ogłoszeń - Serwis ogłoszeń lokalnych', subtitle: 'Lista ogłoszeń dla: "'+expr+'"', kategorie: kategorie, ogloszenia: rows, uzytkownik: session.username });
    });
});




router.get('/zaloguj', function(req, res) {
    res.render('zaloguj', { title: 'Zaloguj - Serwis ogłoszeń lokalnych' });
});

router.post('/zaloguj', function(req, res) {

    var username = req.body.username;
    var password = req.body.password;
    session = req.session;

    connection.query('select Nazwa, Haslo from Uzytkownicy where Nazwa="'+username+'"', function (err, rows, fields) 
    {
        if (err) throw err;
        else 
        {
            if(rows.length > 0)
            {
                if(rows[0]['Haslo'] == password)
                {
                    session.username = username; // ustawiamy sesje
                    res.redirect('/');
                }
            }
            else
            {
                res.redirect('/zaloguj');
            }
        }
    });
});

router.get('/wyloguj', function(req,res)
{
    req.session.destroy(function(err)
    {
        if(err) console.log(err);
        else res.redirect('/');
    });
});

router.get('/paneluzytkownika', function(req,res)
{
    if(session !== undefined)
    {
        connection.query('select * from uzytkownicy where Nazwa like "'+session.username+'"', function (err, rows, fields) 
        {
            if (err) throw err;
            else 
            {
                var user_data = rows[0];
                connection.query('select * from ogloszenia where Uzytkownik_ID like '+ user_data['ID'], function (err, rows, fields)
                {
                    if (err) throw err;
                    else
                    {
                        var liczbaOgloszen = Object.keys(rows).length;
                        //console.log(dateFormat(rows[0]['Data_dodania'], "dddd, mmmm dS, yyyy, h:MM:ss TT"));
                        res.render('userpanel', { title: 'Panel użytkownika - Serwis ogłoszeń lokalnych', ogloszenia: rows, liczbaOgloszen: liczbaOgloszen,  user_data: user_data, uzytkownik: session.username});
                    } 
                });
            }
        });
    }
    else redirect('/');    
});


router.get('/zarejestruj', function(req, res) {
    res.render('zarejestruj', { title: 'Zarejestruj się - Serwis ogłoszeń lokalnych' });
});

router.post('/zarejestruj', function(req, res) {
    
    var username = req.body.username;
    var password = req.body.password;
    var tel = req.body.telefon;
    var email = req.body.email;
    
    connection.query('insert into Uzytkownicy values(default, "'+username+'", "'+password+'", "'+email+'", "'+tel+'")', function (err, rows, fields) 
    {
        if (err) throw err;
        else 
        {
            req.flash('success', 'Pomyślnie dodano nowego użytkownika: '+username+'.');
            res.render('zarejestruj', { title: 'Zarejestruj się - Serwis ogłoszeń lokalnych', powiadomienie: req.flash('success') });
        }
    });
});

module.exports = router;


