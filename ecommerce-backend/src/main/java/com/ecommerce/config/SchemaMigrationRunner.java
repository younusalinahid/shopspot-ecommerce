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
 * also needs orders.user_id to be nullable. Every statement is safe to run on each startup.
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
            "ALTER TABLE orders MODIFY COLUMN user_id BIGINT NULL"
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
