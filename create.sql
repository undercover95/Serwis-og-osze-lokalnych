drop database ogloszenia;
create database ogloszenia;
use ogloszenia;

drop table if exists Kategorie;
create table Kategorie (
    ID int auto_increment primary key not null,
    Nazwa varchar(50) not null unique
);
show warnings;

drop table if exists Uzytkownicy;
create table Uzytkownicy (
    ID int auto_increment primary key not null,
    Nazwa varchar(50) not null unique,
    Haslo varchar(50) not null,
    Mail varchar(80) not null,
    Tel varchar(11) not null
);
show warnings;

drop table if exists Zdjecia_ogloszen;
create table Zdjecia_ogloszen (
    ID_ogloszenia int not null,
    ID_zdjecia int auto_increment primary key not null,
    Sciezka varchar(100) not null unique
);
show warnings;

drop table if exists Ogloszenia;
create table Ogloszenia (
    ID int auto_increment primary key not null,
    Tytul varchar(80) not null,
    Kategoria_ID int not null,
    Opis varchar(1000) not null,
    Lokalizacja varchar(100) not null,
    Cena float(8,2) not null default 0.00,
    Data_dodania datetime not null default CURRENT_TIMESTAMP,
    Uzytkownik_ID int not null default 1,
    Priorytet datetime not null default CURRENT_TIMESTAMP,
    Zdjecie_glowne varchar(100) not null default ''
);
show warnings;

alter table Ogloszenia
add foreign key(Kategoria_ID) references Kategorie(ID) ON DELETE CASCADE ON UPDATE CASCADE,
add foreign key(Uzytkownik_ID) references Uzytkownicy(ID) ON DELETE CASCADE ON UPDATE CASCADE;
show warnings;

alter table Zdjecia_ogloszen
add foreign key(ID_ogloszenia) references Ogloszenia(ID) ON DELETE CASCADE ON UPDATE CASCADE;
show warnings;





insert into Kategorie values (default, 'Antyki i Sztuka');
insert into Kategorie values (default, 'Bizuteria i Zegarki');
insert into Kategorie values (default, 'Dom i Ogrod');
insert into Kategorie values (default,'Dziecko');
insert into Kategorie values (default, 'Filmy');
insert into Kategorie values (default, 'Maszyny i urzadzenia');
insert into Kategorie values (default, 'Gry');
insert into Kategorie values (default, 'Instrumenty');
insert into Kategorie values (default, 'Kolekcje');
insert into Kategorie values (default, 'Komputery');
insert into Kategorie values (default, 'Konsole i automaty');
insert into Kategorie values (default, 'Ksiazki i Komiksy');
insert into Kategorie values (default, 'Motoryzacja');
insert into Kategorie values (default, 'Odziez, Obuwie, Dodatki');
insert into Kategorie values (default, 'Przemysl');
insert into Kategorie values (default, 'Rekodzielo');
insert into Kategorie values (default, 'RTV i AGD');
insert into Kategorie values (default, 'Sport i Turystyka');
insert into Kategorie values (default, 'Telefony i Akcesoria');

insert into Uzytkownicy values (default, 'root', '12345', 'root@mail.com', '123 345 567');

