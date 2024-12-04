const fs = require('fs');

fs.readFile('data_city_year_together.json', 'utf8', (err, data) => {
    if (err) {
        return;
    }

    let records = JSON.parse(data);

    records = records.map(record => {
        if (typeof record.Men === 'number') {
            record.Men_Speed = +(100 / record.Men).toFixed(2);
        } else {
            record.Men_Speed = "-";
        }

        if (typeof record.Women === 'number') {
            record.Women_Speed = +(100 / record.Women).toFixed(2);
        } else {
            record.Women_Speed = "-";
        }

        return record;
    });

    fs.writeFile('modified_records.json', JSON.stringify(records, null, 4), 'utf8', err => {
        if (err) {
            return;
        }
    });
});
