import http from 'k6/http';
import { sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export let options = {
    stages: [
        { duration: '30s', target: 100},
        { duration: '1m', target: 250},
        { duration: '1m', target: 500},
        { duration: '2m', target: 0}
    ]
};

export default function () {
    http.get('${BASE_URL}/feedback');
    sleep(1);
}