DROP TABLE singleChart;
DROP TABLE singleChartSong;
DROP TABLE singleChartEntry;

CREATE TABLE singleChartEntry (
  id INT NOT NULL AUTO_INCREMENT,
  chart TINYINT NOT NULL,
  artist VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT single_chart_entry_u UNIQUE (chart, artist, title)
);

CREATE TABLE singleChart (
  chart TINYINT NOT NULL,
  week DATE NOT NULL,
  ranking INT NOT NULL,
  entry INT NOT NULL,
  PRIMARY KEY (chart, week, ranking),
  KEY Week (week),
  KEY Ranking (ranking),
  KEY ChartWeek (chart, week),
  CONSTRAINT single_chart_fk FOREIGN KEY (entry) REFERENCES singleChartEntry (id)
);

CREATE TABLE singleChartSong (
  entry INT NOT NULL,
  track INT NOT NULL,
  song INT,
  PRIMARY KEY (entry, track),
  CONSTRAINT single_chart_song_fk FOREIGN KEY (entry) REFERENCES singleChartEntry (id)
);

DROP TABLE albumChart;
DROP TABLE albumChartEntry;

CREATE TABLE albumChartEntry (
  id INT NOT NULL AUTO_INCREMENT,
  chart TINYINT NOT NULL,
  artist VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  album VARCHAR(255),
  PRIMARY KEY (id),
  KEY (album),
  CONSTRAINT album_chart_entry_u UNIQUE (chart, artist, title)
);

CREATE TABLE albumChart (
  chart TINYINT NOT NULL,
  week DATE NOT NULL,
  ranking INT NOT NULL,
  entry INT NOT NULL,
  PRIMARY KEY (chart, week, ranking),
  KEY Week (week),
  KEY Ranking (ranking),
  KEY ChartWeek (chart, week),
  CONSTRAINT album_chart_fk FOREIGN KEY (entry) REFERENCES albumChartEntry (id)
);
