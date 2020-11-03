DROP TABLE favoriteArtists;

CREATE TABLE favoriteArtists (
  store CHAR(2) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  PRIMARY KEY (store, artist)
);
