DROP TABLE favoriteArtists;
DROP TABLE favoriteArtistSongs;

CREATE TABLE favoriteArtists (
  store CHAR(2) NOT NULL,
  id VARCHAR(255) NOT NULL,
  gid VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  artwork VARCHAR(255),
  PRIMARY KEY (store, id)
);

CREATE TABLE favoriteArtistSongs (
  store CHAR(2) NOT NULL,
  id VARCHAR(255) NOT NULL,
  gid VARCHAR(255) NOT NULL,
  PRIMARY KEY (store, id)
);
