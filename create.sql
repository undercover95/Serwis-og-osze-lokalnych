drop database ogloszenia;
create database ogloszenia;
use ogloszenia;

drop table if exists Kategorie;
create table Kategorie (
    ID int auto_increment primary key not null,
    Nazwa varchar(50) not null unique
) DEFAULT CHARSET=utf8;
show warnings;

drop table if exists Uzytkownicy;
create table Uzytkownicy (
    ID int auto_increment primary key not null,
    Nazwa varchar(50) not null unique,
    Haslo varchar(50) not null,
    Mail varchar(80) not null,
    Tel varchar(11) not null,
    Awatar varchar(100) not null default ''
) DEFAULT CHARSET=utf8;
show warnings;

drop table if exists Zdjecia_ogloszen;
create table Zdjecia_ogloszen (
    ID_ogloszenia int not null,
    ID_zdjecia int auto_increment primary key not null,
    Sciezka varchar(100) not null unique
) DEFAULT CHARSET=utf8;
show warnings;

drop table if exists Ogloszenia;
create table Ogloszenia (
    ID int auto_increment primary key not null,
    Tytul varchar(80) not null,
    Kategoria_ID int not null,
    Opis varchar(1000) not null,
    Lokalizacja varchar(100) not null,
    Cena float(8,2) not null default 0.00,
    Data_dodania DATETIME NOT NULL,
    Uzytkownik_ID int not null,
    Priorytet TIMESTAMP not null default CURRENT_TIMESTAMP,
    Zdjecie_glowne varchar(100) not null default ''
) DEFAULT CHARSET=utf8;
show warnings;

DELIMITER $$

CREATE TRIGGER Data_dodania_update_trigger
BEFORE INSERT ON Ogloszenia
FOR EACH ROW BEGIN
    SET NEW.Data_dodania = CURRENT_TIMESTAMP;    
END;$$

DELIMITER ;

alter table Ogloszenia
add foreign key(Kategoria_ID) references Kategorie(ID) ON DELETE CASCADE ON UPDATE CASCADE,
add foreign key(Uzytkownik_ID) references Uzytkownicy(ID) ON DELETE CASCADE ON UPDATE CASCADE;
show warnings;

alter table Zdjecia_ogloszen
add foreign key(ID_ogloszenia) references Ogloszenia(ID) ON DELETE CASCADE ON UPDATE CASCADE;
show warnings;


insert into Kategorie values (default, 'Antyki i Sztuka');
insert into Kategorie values (default, 'Biżuteria i Zegarki');
insert into Kategorie values (default, 'Dom i Ogród');
insert into Kategorie values (default,'Dziecko');
insert into Kategorie values (default, 'Filmy');
insert into Kategorie values (default, 'Maszyny i urządzenia');
insert into Kategorie values (default, 'Gry');
insert into Kategorie values (default, 'Instrumenty');
insert into Kategorie values (default, 'Kolekcje');
insert into Kategorie values (default, 'Komputery');
insert into Kategorie values (default, 'Konsole i automaty');
insert into Kategorie values (default, 'Książki i Komiksy');
insert into Kategorie values (default, 'Motoryzacja');
insert into Kategorie values (default, 'Odzież, Obuwie, Dodatki');
insert into Kategorie values (default, 'Przemysł');
insert into Kategorie values (default, 'Rękodzieło');
insert into Kategorie values (default, 'RTV i AGD');
insert into Kategorie values (default, 'Sport i Turystyka');
insert into Kategorie values (default, 'Telefony i Akcesoria');

insert into Uzytkownicy values (default, 'root', '12345', 'root@mail.com', '123 345 567', default);

