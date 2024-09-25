import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
    stages: [
        { duration: '30s', target: 250 },
        { duration: '1m', target: 2500 },
        { duration: '1m', target: 5000 },
        { duration: '2m', target: 0 }
    ]
};

export default function () {
    http.get('http://127.0.0.1.49270/feedback')
    sleep(1);
}