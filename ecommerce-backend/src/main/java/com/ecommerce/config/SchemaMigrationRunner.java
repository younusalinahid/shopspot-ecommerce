package com.ecommerce.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.List;

/**
 * Small one-off schema fixes that "ddl-auto=update" cannot apply by itself.
 *
 * Older databases created the order status / payment method columns as MySQL ENUMs, so new
 * values such as CONFIRMED fail with "Data truncated for column 'status'". Guest checkout
 * also needs orders.user_id to be nullable, and old orders need a payment method.
 * Every statement is safe to run on each startup.
 */
@Slf4j
@Component
@Order(0)
@RequiredArgsConstructor
public class SchemaMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    private static final List<String> MYSQL_STATEMENTS = List.of(
            "ALTER TABLE orders MODIFY COLUMN status VARCHAR(30) NOT NULL",
            "ALTER TABLE orders MODIFY COLUMN payment_method VARCHAR(20) NOT NULL",
            "ALTER TABLE orders MODIFY COLUMN user_id BIGINT NULL",
            // Orders created before COD existed got an empty payment method, which breaks
            // the admin and "My Orders" pages ("No enum constant PaymentMethod.").
            "UPDATE orders SET payment_method = 'CARD' WHERE payment_method IS NULL OR payment_method = ''",
            "UPDATE orders SET cod_collected = 0 WHERE cod_collected IS NULL",
            // Site content uses Bangla text and the Taka sign, which need utf8mb4
            "ALTER TABLE site_settings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
            "ALTER TABLE info_pages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    );

    @Override
    public void run(String... args) {
        if (!isMySql()) {
            return;
        }
        for (String sql : MYSQL_STATEMENTS) {
            try {
                jdbcTemplate.execute(sql);
            } catch (Exception e) {
                log.warn("Schema migration skipped [{}]: {}", sql, e.getMessage());
            }
        }
        log.info("Schema migration check completed");
    }

    private boolean isMySql() {
        try (Connection connection = dataSource.getConnection()) {
            String product = connection.getMetaData().getDatabaseProductName().toLowerCase();
            return product.contains("mysql") || product.contains("mariadb");
        } catch (Exception e) {
            log.warn("Could not detect database type: {}", e.getMessage());
            return false;
        }
    }
}
