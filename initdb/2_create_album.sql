USE chart;

DROP TABLE IF EXISTS albumChart;
DROP TABLE IF EXISTS albumChartMatch;
DROP TABLE IF EXISTS albumChartEntry;

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

CREATE TABLE albumChartMatch (
  entry INT NOT NULL,
  store CHAR(2) NOT NULL,
  idx INT NOT NULL,
  id VARCHAR(255),
  PRIMARY KEY (entry, store, idx),
  CONSTRAINT album_chart_match_fk FOREIGN KEY (entry) REFERENCES albumChartEntry (id)
);
