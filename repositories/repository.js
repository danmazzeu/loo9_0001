const axios = require('axios');
const CLASH_API_URL = 'https://api.clashofclans.com/v1';
const CLASH_TOKEN = process.env.CLASH_TOKEN;
const headers = { 'Authorization': `Bearer ${CLASH_TOKEN}` };

const handleApiError = (error) => {
    if (error.response) {
        if (error.response.status === 503) {
            console.error('Servidor está em manutenção. Tente novamente mais tarde.');
            return { error: 'Servidor está em manutenção. Tente novamente mais tarde.' };
        }
        console.error(`Erro de Servidor: ${error.response.status} - ${error.response.data.message}`);
    } else {
        console.error(`Erro ao conectar-se ao Servidor: ${error.message}`);
    }
    return null;
};

const getPlayerInfo = async (playerTag) => {
    try {
        const encodedTag = encodeURIComponent(playerTag);
        const response = await axios.get(`${CLASH_API_URL}/players/${encodedTag}`, { headers });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

const getClanInfo = async (clanTag) => {
    try {
        const encodedTag = encodeURIComponent(clanTag);
        const response = await axios.get(`${CLASH_API_URL}/clans/${encodedTag}`, { headers });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

const getWarInfo = async (clanTag) => {
    try {
        const encodedTag = encodeURIComponent(clanTag);
        const response = await axios.get(`${CLASH_API_URL}/clans/${encodedTag}/currentwar`, { headers });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

const getGoldPassInfo = async () => {
    try {
        const response = await axios.get(`${CLASH_API_URL}/goldpass/seasons/current`, { headers });
        console.log*(response.data);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

module.exports = {
    getPlayerInfo,
    getClanInfo,
    getWarInfo,
    getGoldPassInfo
};
