#week="2021-07-31"
#week="2021-07-24"
week="2022-01-01"

for type in single album
do
  for code in us jp gb fr kr
  do
    curl "localhost:3010/api/chart/fetch/$type/$code/$week"
    for store in us jp
    do
      curl "localhost:3010/api/chart/match/$type/$code/$week/$store"
    done
  done
done
