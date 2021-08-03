USE chart;

DROP TABLE IF EXISTS singleChart;
DROP TABLE IF EXISTS singleChartMatch;
DROP TABLE IF EXISTS singleChartEntry;

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

CREATE TABLE singleChartMatch (
  entry INT NOT NULL,
  store CHAR(2) NOT NULL,
  idx INT NOT NULL,
  id VARCHAR(255),
  PRIMARY KEY (entry, store, idx),
  CONSTRAINT single_chart_match_fk FOREIGN KEY (entry) REFERENCES singleChartEntry (id)
);
