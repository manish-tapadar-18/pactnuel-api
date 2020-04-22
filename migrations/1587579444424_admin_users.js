module.exports = {
    "up": "INSERT INTO `c_user` (`ID`, `EMAIL`, `PASSWORD`, `NAME`, `ROLE`, `COUNTRY_CODE`, `MOBILE`, `CREATED_AT`, `UPDATED_AT`) VALUES ('qweredsxcd', 'admin@pactnuel.com', MD5('admin'), 'Admin', '{\\\"ROLES\\\":[\\\"admin\\\"]}', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);",
    "down": "DELETE FROM `c_user` WHERE `c_user`.`ID` = \\'qweredsxcd\\'"
}