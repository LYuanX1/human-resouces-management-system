package com.example.utils;

import com.alibaba.druid.pool.DruidDataSourceFactory;
import javax.sql.DataSource;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Properties;

public class DruidUtils {
    private static DataSource dataSource;

    static {
        try {
            Properties prop = new Properties();
            // 读取 src 下的配置文件
            InputStream is = DruidUtils.class.getClassLoader().getResourceAsStream("druid.properties");
            prop.load(is);
            dataSource = DruidDataSourceFactory.createDataSource(prop);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static DataSource getDataSource() {
        return dataSource;
    }

    // DbUtils 不需要手动关闭Connection，QueryRunner会自动处理，但为了严谨可以保留
    public static Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }
}