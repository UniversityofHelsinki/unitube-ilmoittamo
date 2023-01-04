const notify = require('../service/notify');
const apiService = require('../service/apiService');


afterAll(async () => {
    jest.clearAllMocks();
});

jest.mock('../service/apiService');


describe('Recipients tests', () => {
    it('getRecipientsMap returns only unique recipients with one video with same contributor assigned directly and by group', async () => {

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
                    {
                        "username" : "mustikka",
                        "email" :  "marja.mustikka@mansikanpoimijat.fi"
                    },
                    {
                        "username" : "mansikka",
                        "email" :  "marja.mansikka@mansikanpoimijat.fi"
                    },
                    {
                        "username" : "puolukka",
                        "email" : "marja.puolukka@mansikanpoimijat.fi"
                    },
                    {
                        "username" : "karpalo",
                        "email" : "marja.karpalo@mansikanpoimijat.fi"
                    },
                    {
                        "username" : "mesimarja",
                        "email" : "marja.mesimarja@mansikanpoimijat.fi"
                    },
                    {
                        "username" : "vadelma",
                        "email" : "marja.vadelma@mansikanpoimijat.fi"
                    },
                    {
                        "username" : "mustaherukka",
                        "email" : "marja.mustaherukka@mansikanpoimijat.fi"
                    }
                ]
            }
        });


        const recipientsInMap = await notify.getRecipientsMap(videosToSendNotification);
        //expect(recipientsInMap.size).toEqual(7);
        expect(recipientsInMap.has("marja.mansikka@mansikanpoimijat.fi")).toBe(true);
        expect(recipientsInMap.get("marja.mansikka@mansikanpoimijat.fi").length).toEqual(1);
        expect(recipientsInMap.get('marja.mansikka@mansikanpoimijat.fi')[0].video.identifier).toEqual('cda5d8bf-eb6d-41a6-b7ae-6271f8ab0b99');
        expect(recipientsInMap.get('marja.mansikka@mansikanpoimijat.fi')[0].video.title).toEqual('joku video');
    });


    it('getRecipientsMap returns only unique recipients with two videos with same contributor assigned directly and by group', async () => {

        const videosToSendNotification = {
            "command": "SELECT",
            "rowCount": 2,
            "oid": null,
            "rows": [
                {
                    "video_id": "cda5d8bf-eb6d-41a6-b7ae-6271f8ab0b99",
                    "archived_date": "15.02.2023"
                },
                {
                    "video_id": "cda5d8bf-eb6d-41a6-b7ae-6271f8ab0b98",
                    "archived_date": "15.02.2022"
                }
            ]
        };


        apiService.getSeries.mockResolvedValueOnce({
            status: 200,
            data: {
                identifier: '379fb94c-f194-422a-be6e-fc24f966666',
                title: 'joku sarja 1',
                contributors: ['grp-mansikanpoimijat', 'mansikka']
            }
        });

        apiService.getSeries.mockResolvedValueOnce({
            status: 200,
            data: {
                identifier: '379fb94c-f194-422a-be6e-fc24f9555555',
                title: 'joku sarja 2',
                contributors: ['grp-mansikanpoimijat', 'mansikka']
            }
        });

        apiService.getEvent.mockResolvedValueOnce({
            status: 200,
            data: {
                identifier: 'cda5d8bf-eb6d-41a6-b7ae-6271f8ab0b99',
                title: 'joku video 1',
            }
        });

        apiService.getEvent.mockResolvedValueOnce({
            status: 200,
            data: {
                identifier: 'cda5d8bf-eb6d-41a6-b7ae-6271f8ab0b98',
                title: 'joku video 2',
            }
        });

        apiService.getRecipients.mockResolvedValue({
            status: 200,
            data: {
                "group": "grp-mansikanpoimijat",
                "members": [
                    {
                        "username" : "mustikka",
                        "email" :  "marja.mustikka@mansikanpoimijat.fi"
                    },
                    {
                        "username" : "mansikka",
                        "email" :  "marja.mansikka@mansikanpoimijat.fi"
                    },
                    {
                        "username" : "puolukka",
                        "email" : "marja.puolukka@mansikanpoimijat.fi"
                    },
                    {
                        "username" : "karpalo",
                        "email" : "marja.karpalo@mansikanpoimijat.fi"
                    },
                    {
                        "username" : "mesimarja",
                        "email" : "marja.mesimarja@mansikanpoimijat.fi"
                    },
                    {
                        "username" : "vadelma",
                        "email" : "marja.vadelma@mansikanpoimijat.fi"
                    },
                    {
                        "username" : "mustaherukka",
                        "email" : "marja.mustaherukka@mansikanpoimijat.fi"
                    }
                ]
            }
        });


        const recipientsInMap = await notify.getRecipientsMap(videosToSendNotification);
        //expect(recipientsInMap.size).toEqual(7);
        expect(recipientsInMap.has("marja.mustikka@mansikanpoimijat.fi")).toBe(true);
        expect(recipientsInMap.get("marja.mustikka@mansikanpoimijat.fi").length).toEqual(2);
        expect(recipientsInMap.get('marja.mustikka@mansikanpoimijat.fi')[0].video.identifier).toEqual('cda5d8bf-eb6d-41a6-b7ae-6271f8ab0b99');
        expect(recipientsInMap.get('marja.mustikka@mansikanpoimijat.fi')[0].video.title).toEqual('joku video 1');
        expect(recipientsInMap.get('marja.mustikka@mansikanpoimijat.fi')[1].video.identifier).toEqual('cda5d8bf-eb6d-41a6-b7ae-6271f8ab0b98');
        expect(recipientsInMap.get('marja.mustikka@mansikanpoimijat.fi')[1].video.title).toEqual('joku video 2');
    });

    it('getRecipientsMap returns only unique recipients and one video if recipient is not found in group', async () => {

        const videosToSendNotification = {
            "command": "SELECT",
            "rowCount": 2,
            "oid": null,
            "rows": [
                {
                    "video_id": "cda5d8bf-eb6d-41a6-b7ae-6271f8ab0b99",
                    "archived_date": "15.02.2023"
                },
                {
                    "video_id": "cda5d8bf-eb6d-41a6-b7ae-6271f8ab0b98",
                    "archived_date": "15.02.2022"
                }
            ]
        };


        apiService.getSeries.mockResolvedValueOnce({
            status: 200,
            data: {
                identifier: '379fb94c-f194-422a-be6e-fc24f9507b95',
                title: 'joku sarja',
                contributors: ['grp-mansikanpoimijat', 'mansikka']
            }
        });

        apiService.getSeries.mockResolvedValueOnce({
            status: 200,
            data: {
                identifier: '379fb94c-f194-422a-be6e-fc24f9507b98',
                title: 'joku sarja',
                contributors: ['grp-mansikanpoimijat', 'mansikka', 'variksenmarja']
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
                    {
                        "username" : "mustikka",
                        "email" :  "marja.mustikka@mansikanpoimijat.fi"
                    },
                    {
                        "username" : "mansikka",
                        "email" :  "marja.mansikka@mansikanpoimijat.fi"
                    },
                    {
                        "username" : "puolukka",
                        "email" : "marja.puolukka@mansikanpoimijat.fi"
                    },
                    {
                        "username" : "karpalo",
                        "email" : "marja.karpalo@mansikanpoimijat.fi"
                    },
                    {
                        "username" : "mesimarja",
                        "email" : "marja.mesimarja@mansikanpoimijat.fi"
                    },
                    {
                        "username" : "vadelma",
                        "email" : "marja.vadelma@mansikanpoimijat.fi"
                    },
                    {
                        "username" : "mustaherukka",
                        "email" : "marja.mustaherukka@mansikanpoimijat.fi"
                    }
                ]
            }
        });


        const recipientsInMap = await notify.getRecipientsMap(videosToSendNotification);
        //expect(recipientsInMap.size).toEqual(8);
        expect(recipientsInMap.has("marja.mansikka@mansikanpoimijat.fi")).toBe(true);
        expect(recipientsInMap.get('marja.mansikka@mansikanpoimijat.fi')[0].video.identifier).toEqual('cda5d8bf-eb6d-41a6-b7ae-6271f8ab0b99');
        expect(recipientsInMap.get('marja.mansikka@mansikanpoimijat.fi')[0].video.title).toEqual('joku video');
        expect(recipientsInMap.get("marja.mansikka@mansikanpoimijat.fi").length).toEqual(2);
        //expect(recipientsInMap.has("variksenmarja@ad.helsinki.fi")).toBe(true);
        //expect(recipientsInMap.get('variksenmarja@ad.helsinki.fi')[0].video.identifier).toEqual('cda5d8bf-eb6d-41a6-b7ae-6271f8ab0b99');
        //expect(recipientsInMap.get('variksenmarja@ad.helsinki.fi')[0].video.title).toEqual('joku video');
        //expect(recipientsInMap.get("variksenmarja@ad.helsinki.fi").length).toEqual(1);
    });

});
