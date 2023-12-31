"""empty message

Revision ID: 0a6f176861da
Revises: 56068cf184a6
Create Date: 2023-08-20 21:54:45.509980

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '0a6f176861da'
down_revision = '56068cf184a6'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('users', 'encrypted_password',
               existing_type=mysql.VARCHAR(length=120),
               nullable=True)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('users', 'encrypted_password',
               existing_type=mysql.VARCHAR(length=120),
               nullable=False)
    # ### end Alembic commands ###
