const notify = require('../service/notify');
const apiService = require('../service/apiService');


afterAll(async () => {
    jest.clearAllMocks();
});

jest.mock('../service/apiService');

const videosToSendNotification = {
    "command": "SELECT",
    "rowCount": 1,
    "oid": null,
    "rows": [
        {
            "video_id": "cda5d8bf-eb6d-41a6-b7ae-6271f8ab0b99",
            "archived_date": "15.02.2023"
        },
    ]
};


describe('video recipients tests', () => {
    it('getRecipientsMap returns only unique recipients even if recipient is returned from iam-group', async () => {

        apiService.getSeries.mockResolvedValue({
            status: 200,
            data: {
                identifier: '379fb94c-f194-422a-be6e-fc24f9507b95',
                title: 'joku sarja',
                contributors: ['grp-mansikanpoimijat', 'mansikka']
            }
        });

        apiService.getEvent.mockResolvedValue({
            status: 200,
            data: {
                identifier: 'cda5d8bf-eb6d-41a6-b7ae-6271f8ab0b99',
                title: 'joku video',
            }
        });

        apiService.getRecipients.mockResolvedValue({
            status: 200,
            data: {
                "group": "grp-mansikanpoimijat",
                "members": [
                    "mustikka",
                    "mansikka",
                    "puolukka",
                    "karpalo",
                    "mesimarja",
                    "vadelma",
                    "mustaherukka"
                ]
            }
        });


        const recipientsInMap = await notify.getRecipientsMap(videosToSendNotification);
        expect(recipientsInMap.size).toEqual(7);
        expect(recipientsInMap.get("mansikka@ad.helsinki.fi").length).toEqual(1);
    });
});
