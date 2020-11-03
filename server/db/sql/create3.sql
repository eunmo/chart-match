DROP TABLE favoriteArtists;
DROP TABLE favoriteArtistSongs;
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

CREATE TABLE favoriteArtistSong (
  store CHAR(2) NOT NULL,
  id VARCHAR(255) NOT NULL,
  gid VARCHAR(255) NOT NULL,
  PRIMARY KEY (store, id)
);
