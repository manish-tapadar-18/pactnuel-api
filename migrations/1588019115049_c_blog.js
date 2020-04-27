module.exports = {
    "up": "create table if not exists c_blog\n" +
      "(\n" +
      "\tID varchar(20) not null\n" +
      "\t\tprimary key,\n" +
      "\tTITLE text not null,\n" +
      "\tDESCRIPTION text null,\n" +
      "\tFEATURE_IMAGE varchar(20) null,\n" +
      "\tFEATURE_VIDEO varchar(20) null,\n" +
      "\tPUBLICATION varchar(20) null,\n" +
      "\tAUTHOR_BY varchar(20) not null,\n" +
      "\tCONTENT json not null,\n" +
      "\tVIEWS int(20) default 0 not null,\n" +
      "\tSTATUS enum('DRAFT', 'PUBLISHED', 'ARCHIVED', 'DELETED') not null,\n" +
      "\tCREATED_AT timestamp default CURRENT_TIMESTAMP not null,\n" +
      "\tUPDATED_AT timestamp null,\n" +
      "\tconstraint c_blog_c_file_ID_fk\n" +
      "\t\tforeign key (FEATURE_IMAGE) references c_file (ID),\n" +
      "\tconstraint c_blog_c_file_ID_fk_2\n" +
      "\t\tforeign key (FEATURE_VIDEO) references c_file (ID),\n" +
      "\tconstraint c_blog_c_user_ID_fk\n" +
      "\t\tforeign key (AUTHOR_BY) references c_user (ID)\n" +
      ");\n" +
      "\n",
    "down": "DROP table c_blog;"
}