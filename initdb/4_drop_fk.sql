USE chart;

ALTER TABLE singleChart DROP FOREIGN KEY single_chart_fk;
ALTER TABLE singleChartMatch DROP FOREIGN KEY single_chart_match_fk;
ALTER TABLE albumChart DROP FOREIGN KEY album_chart_fk;
ALTER TABLE albumChartMatch DROP FOREIGN KEY album_chart_match_fk;
ALTER TABLE favoriteArtistAlbum DROP FOREIGN KEY faa_fk;
