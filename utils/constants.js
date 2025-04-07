const VIDEO_NOTIFIED_THREE_MONTHS = 3;
const VIDEO_NOTIFIED_ONE_MONTH = 1;
const VIDEO_NOTIFIED_INTERVAL_ONE_WEEK = 1;
const VIDEO_NOTIFIED_INTERVAL_THREE_DAYS = 3;
const VIDEO_NOTIFIED_START_SIX_DAYS = 6;
const VIDEO_NOTIFIED_END_NINE_DAYS = 9;
const THREE_MONTHS = 'THREE MONTHS';
const ONE_MONTH = 'ONE MONTH';
const ONE_WEEK = 'ONE WEEK';
const OPENCAST_EVENTS_PATH = '/api/events/';
const OPENCAST_SERIES_PATH = '/api/series/';
const IAM_GROUPS_PATH_PREFIX = '/iam/groups/group/';
const IAM_GROUPS_PATH_POSTFIX = '/members';
const IAM_GROUP_PREFIXES = ['grp-', 'hy-', 'sys-'];
const IAM_ACCOUNT_EMAIL = '/iam/groups/account/emails';
const TRASH = 'trash';
const EXPIRATIONMESSAGE = 'Vanhenemisviesti';
const FLAMMA_MESSAGE_HEADING = 'Unitube: sinulla on vanhenevia videoita!';
const FLAMMA_MESSAGE_FOOTER_FI = 'Kaikilla Unitube-tallenteilla on voimassaoloaika, jonka jälkeen ne poistuvat palvelusta. Voimassaoloaika on aina korkeintaan kolme vuotta kerrallaan.\nJos haluat, voit jatkaa itse hallinnoimiesi tallenteiden voimassaoloa Unitube-lataamossa osoitteessa:';
const FLAMMA_MESSAGE_FOOTER_SV =  'Alla Unitube-inspelningar har ett utgångsdatum efter vilket de tas bort från tjänsten. Giltighetstiden kan vara upp till tre år åt gången.\nOm du vill kan du förlänga giltighetstiden för dina hanterade inspelningar på Unitube-uppladdningssajten på:';
const FLAMMA_MESSAGE_FOOTER_EN = 'All Unitube recordings have an expiration date, after which they will be removed from the service. The validity period can be up to three years at a time.\nIf you wish, you can extend the validity of your managed recordings in the Unitube Uploader service at:';

module.exports = {
    VIDEO_NOTIFIED_THREE_MONTHS,
    VIDEO_NOTIFIED_ONE_MONTH,
    VIDEO_NOTIFIED_INTERVAL_ONE_WEEK,
    VIDEO_NOTIFIED_INTERVAL_THREE_DAYS,
    VIDEO_NOTIFIED_START_SIX_DAYS,
    VIDEO_NOTIFIED_END_NINE_DAYS,
    THREE_MONTHS,
    ONE_MONTH,
    ONE_WEEK,
    OPENCAST_EVENTS_PATH,
    OPENCAST_SERIES_PATH,
    IAM_GROUPS_PATH_PREFIX,
    IAM_GROUPS_PATH_POSTFIX,
    IAM_GROUP_PREFIXES,
    TRASH,
    EXPIRATIONMESSAGE,
    IAM_ACCOUNT_EMAIL,
    FLAMMA_MESSAGE_HEADING,
    FLAMMA_MESSAGE_FOOTER_FI,
    FLAMMA_MESSAGE_FOOTER_EN,
    FLAMMA_MESSAGE_FOOTER_SV
};
