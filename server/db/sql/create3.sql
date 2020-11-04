DROP TABLE favoriteArtistAlbum;
DROP TABLE favoriteArtist;
DROP TABLE favoriteArtistSong;

CREATE TABLE favoriteArtist (
  store CHAR(2) NOT NULL,
  id VARCHAR(255) NOT NULL,
  gid VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  artwork VARCHAR(255),
  PRIMARY KEY (store, id)
);

CREATE TABLE favoriteArtistAlbum (
  store CHAR(2) NOT NULL,
  id VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  included BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (store, id),
  CONSTRAINT faa_fk FOREIGN KEY (store, artist) REFERENCES favoriteArtist (store, id) ON DELETE CASCADE
);

CREATE TABLE favoriteArtistSong (
  store CHAR(2) NOT NULL,
  id VARCHAR(255) NOT NULL,
  gid VARCHAR(255) NOT NULL,
  PRIMARY KEY (store, id)
);
